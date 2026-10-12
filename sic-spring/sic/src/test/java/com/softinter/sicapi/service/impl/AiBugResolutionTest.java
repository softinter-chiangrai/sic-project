package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.AiBugResolutionRequest;
import com.softinter.sicapi.dto.response.AiBugResolutionResponse;
import com.softinter.sicapi.repository.pm.PmBugRepository;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.pm.PmTestCaseRepository;
import com.softinter.sicapi.service.AuditLogService;
import com.softinter.sicapi.service.PmAiProviderService;
import com.softinter.sicapi.service.TraceLinkService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class AiBugResolutionTest {

    private PmBugRepository bugRepository;
    private PmTaskRepository taskRepository;
    private PmTestCaseRepository testCaseRepository;
    private AuditLogService auditLogService;
    private TraceLinkService traceLinkService;
    private PmAiProviderService aiProviderService;
    private PmBugServiceImpl service;

    @BeforeEach
    void setUp() {
        bugRepository = Mockito.mock(PmBugRepository.class);
        taskRepository = Mockito.mock(PmTaskRepository.class);
        testCaseRepository = Mockito.mock(PmTestCaseRepository.class);
        auditLogService = Mockito.mock(AuditLogService.class);
        traceLinkService = Mockito.mock(TraceLinkService.class);
        aiProviderService = Mockito.mock(PmAiProviderService.class);

        service = new PmBugServiceImpl(
                bugRepository,
                taskRepository,
                testCaseRepository,
                auditLogService,
                traceLinkService,
                aiProviderService
        );
    }

    @Test
    void analyzeBugResolution_success_thai() {
        String aiJsonResponse = """
            ```json
            {
              "rootCause": "NullPointerException เกิดจากการเข้าถึง customer.getAddress() โดยไม่มีการ null check ก่อนส่งไปยัง payment gateway",
              "suggestedFix": "1. เพิ่ม Optional.ofNullable(customer.getAddress())\\n2. ตรวจสอบ validation @NotNull ใน Request DTO ก่อนเข้า Service layer",
              "preventionTest": "เพิ่ม Unit Test ที่จำลอง Customer Address เป็น null และ assert ว่าระบบโยน ValidationException ที่ชัดเจน",
              "recommendedSeverity": "HIGH",
              "confidenceScore": 95,
              "codeSnippet": "if (customer.getAddress() == null) { throw new BadRequestException(\\"Address required\\"); }"
            }
            ```
            """;

        when(aiProviderService.generateRawResponse(anyString(), anyString(), nullable(String.class))).thenReturn(aiJsonResponse);

        AiBugResolutionRequest request = new AiBugResolutionRequest();
        request.setTitle("NullPointerException in Checkout");
        request.setDescription("User clicks pay button and server returns 500 error");
        request.setStepsToReproduce("1. Add item to cart\n2. Skip address\n3. Click Pay");
        request.setEnvironment("Staging");
        request.setLang("th");

        AiBugResolutionResponse response = service.analyzeBugResolution(request, UUID.randomUUID());

        assertNotNull(response);
        assertEquals("th", response.getLang());
        assertTrue(response.getRootCause().contains("NullPointerException"));
        assertTrue(response.getSuggestedFix().contains("Optional"));
        assertEquals("HIGH", response.getRecommendedSeverity());
        assertEquals(95, response.getConfidenceScore());
        assertNotNull(response.getCodeSnippet());
    }

    @Test
    void analyzeBugResolution_success_english() {
        String aiJsonResponse = """
            {
              "rootCause": "Race condition in stock deduction when concurrent requests are placed.",
              "suggestedFix": "1. Use pessimistic locking (SELECT FOR UPDATE) on inventory row.\\n2. Or use Redis distributed lock.",
              "preventionTest": "Write a multi-threaded integration test with ExecutorService to verify stock consistency under 50 concurrent checkouts.",
              "recommendedSeverity": "CRITICAL",
              "confidenceScore": 90,
              "codeSnippet": "@Lock(LockModeType.PESSIMISTIC_WRITE)\\nOptional<Stock> findByIdForUpdate(UUID id);"
            }
            """;

        when(aiProviderService.generateRawResponse(anyString(), anyString(), nullable(String.class))).thenReturn(aiJsonResponse);

        AiBugResolutionRequest request = new AiBugResolutionRequest();
        request.setTitle("Stock overselling under high concurrency");
        request.setDescription("Inventory count becomes negative during flash sale");
        request.setLang("en");

        AiBugResolutionResponse response = service.analyzeBugResolution(request, UUID.randomUUID());

        assertNotNull(response);
        assertEquals("en", response.getLang());
        assertTrue(response.getRootCause().contains("Race condition"));
        assertEquals("CRITICAL", response.getRecommendedSeverity());
        assertEquals(90, response.getConfidenceScore());
    }

    @Test
    void analyzeBugResolution_emptyDetails_returnsGracefulResponse() {
        AiBugResolutionRequest request = new AiBugResolutionRequest();
        request.setLang("th");

        AiBugResolutionResponse response = service.analyzeBugResolution(request, UUID.randomUUID());

        assertNotNull(response);
        assertEquals("th", response.getLang());
        assertEquals(0, response.getConfidenceScore());
        assertTrue(response.getRootCause().contains("ไม่เพียงพอ"));
    }
}
