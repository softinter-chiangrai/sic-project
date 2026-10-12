package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.AiDbValidationRequest;
import com.softinter.sicapi.dto.response.AiDbValidationResponse;
import com.softinter.sicapi.repository.PmDiagramSqlHistoryRepository;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmAiProviderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class AiDbValidationTest {

    private PmAiProviderService aiProviderService;
    private PmDiagramSqlHistoryRepository historyRepository;
    private CurrentUserService currentUserService;
    private AiSqlGeneratorServiceImpl service;

    private static final String SAMPLE_ER_XML = """
        <mxGraphModel>
          <root>
            <mxCell id="0"/>
            <mxCell id="1" parent="0"/>
            <mxCell id="2" value="orders&#xa;id: PK&#xa;customer_id: UUID&#xa;status: varchar&#xa;total_amount: decimal" vertex="1" parent="1"/>
            <mxCell id="3" value="order_items&#xa;id: PK&#xa;order_id: UUID&#xa;product_id: UUID&#xa;quantity: int" vertex="1" parent="1"/>
            <mxCell id="4" edge="1" source="2" target="3" parent="1"/>
          </root>
        </mxGraphModel>
        """;

    @BeforeEach
    void setUp() {
        aiProviderService = Mockito.mock(PmAiProviderService.class);
        historyRepository = Mockito.mock(PmDiagramSqlHistoryRepository.class);
        currentUserService = Mockito.mock(CurrentUserService.class);
        service = new AiSqlGeneratorServiceImpl(aiProviderService, historyRepository, currentUserService);
    }

    @Test
    void validateDbDesign_success_thai() {
        String aiJsonResponse = """
            ```json
            {
              "score": 85,
              "grade": "B",
              "summary": "โครงสร้างตารางมีความสอดคล้องตามเกณฑ์ แต่พบการขาด Index บน Foreign Keys ที่สำคัญ",
              "missingIndexes": [
                {
                  "table": "orders",
                  "column": "customer_id",
                  "riskLevel": "HIGH",
                  "issue": "ไม่มี Index บน foreign key customer_id",
                  "recommendation": "สร้าง CREATE INDEX idx_orders_customer_id ON orders(customer_id);"
                }
              ],
              "normalizationRisks": [
                {
                  "table": "orders",
                  "column": "status",
                  "riskLevel": "LOW",
                  "issue": "อาจพิจารณาแยกสถานะเป็น Enum หรือ Lookup Table",
                  "recommendation": "ใช้ ENUM หรือตาราง order_status"
                }
              ],
              "typeAndConstraintRisks": [],
              "suggestedFixSql": "CREATE INDEX idx_orders_customer_id ON orders(customer_id);"
            }
            ```
            """;

        when(aiProviderService.generateRawResponse(anyString(), anyString(), nullable(String.class))).thenReturn(aiJsonResponse);

        AiDbValidationRequest request = new AiDbValidationRequest();
        request.setXml(SAMPLE_ER_XML);
        request.setPageName("Order Module");
        request.setVendor("postgresql");
        request.setLang("th");

        AiDbValidationResponse response = service.validateDbDesign(request);

        assertNotNull(response);
        assertEquals(85, response.getScore());
        assertEquals("B", response.getGrade());
        assertEquals("th", response.getLang());
        assertEquals(1, response.getMissingIndexes().size());
        assertEquals("orders", response.getMissingIndexes().get(0).getTable());
        assertEquals("customer_id", response.getMissingIndexes().get(0).getColumn());
        assertEquals("HIGH", response.getMissingIndexes().get(0).getRiskLevel());
        assertNotNull(response.getSuggestedFixSql());
    }

    @Test
    void validateDbDesign_success_english() {
        String aiJsonResponse = """
            {
              "score": 92,
              "grade": "A",
              "summary": "Good relational structure. Minor indexing optimization recommended.",
              "missingIndexes": [
                {
                  "table": "order_items",
                  "column": "order_id",
                  "riskLevel": "HIGH",
                  "issue": "Missing index on foreign key column order_id",
                  "recommendation": "CREATE INDEX idx_order_items_order_id ON order_items(order_id);"
                }
              ],
              "normalizationRisks": [],
              "typeAndConstraintRisks": [],
              "suggestedFixSql": "CREATE INDEX idx_order_items_order_id ON order_items(order_id);"
            }
            """;

        when(aiProviderService.generateRawResponse(anyString(), anyString(), nullable(String.class))).thenReturn(aiJsonResponse);

        AiDbValidationRequest request = new AiDbValidationRequest();
        request.setXml(SAMPLE_ER_XML);
        request.setPageName("Order Items");
        request.setVendor("postgresql");
        request.setLang("en");

        AiDbValidationResponse response = service.validateDbDesign(request);

        assertNotNull(response);
        assertEquals(92, response.getScore());
        assertEquals("A", response.getGrade());
        assertEquals("en", response.getLang());
        assertEquals(1, response.getMissingIndexes().size());
    }

    @Test
    void validateDbDesign_emptyTables_returnsScoreZero() {
        AiDbValidationRequest request = new AiDbValidationRequest();
        request.setXml("<mxGraphModel><root><mxCell id=\"0\"/></root></mxGraphModel>");
        request.setLang("th");

        AiDbValidationResponse response = service.validateDbDesign(request);

        assertNotNull(response);
        assertEquals(0, response.getScore());
        assertEquals("F", response.getGrade());
        assertTrue(response.getSummary().contains("ไม่พบตาราง"));
    }
}
