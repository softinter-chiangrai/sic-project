package com.softinter.sicapi.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.request.AiNavigatorChatRequest;
import com.softinter.sicapi.dto.response.AiNavigatorChatResponse;
import com.softinter.sicapi.dto.response.AiRouteSuggestionDto;
import com.softinter.sicapi.service.AiModuleRegistry;
import com.softinter.sicapi.service.AiNavigatorService;
import com.softinter.sicapi.service.PmAiProviderService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiNavigatorServiceImpl implements AiNavigatorService {

    private final PmAiProviderService aiProviderService;
    private final AiModuleRegistry moduleRegistry;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Pattern JSON_PATTERN = Pattern.compile("```json\\s*([\\s\\S]*?)```");

    private static final String WORKFLOW_KB = """
            ลำดับการทำงานหลักของระบบ SIC (System Integration Center) โดยสรุป:
            1. ตั้งค่าองค์กร: สร้าง Role/บทบาท -> สร้าง Team/ทีม -> เชิญสมาชิกเข้า Business
            2. ตั้งค่า Approval Flow สำหรับขั้นตอนอนุมัติเอกสารต่างๆ
            3. สร้างข้อมูลลูกค้า (Customer) -> สร้างโครงการ (Project) -> สร้างสัญญา (Contract)
            4. บันทึกความต้องการ (Requirement) -> ผ่านขั้นตอนอนุมัติ (Approval Center)
            5. จัดทำ Specification / Change Request ตามความจำเป็น
            6. สร้าง Test Scenario และ Test Case -> ทำการทดสอบ (Test Execution) -> บันทึกผล Pass/Fail และ Bug
            7. จัดทำ Delivery (ส่งมอบงาน) -> ออก Invoice (ใบแจ้งหนี้)
            8. หลังส่งมอบ ใช้ MA Ticket สำหรับงานบำรุงรักษา (Maintenance)
            9. ใช้ Gantt Chart และ Audit Log ในการติดตามความคืบหน้าและตรวจสอบย้อนหลัง
            """;

    @Override
    public AiNavigatorChatResponse chat(AiNavigatorChatRequest request) {
        String message = request.getMessage() != null ? request.getMessage() : "";
        String systemPrompt = buildSystemPrompt();

        String userPrompt = "หน้าปัจจุบันของผู้ใช้: " + (request.getCurrentPath() != null ? request.getCurrentPath() : "-")
                + "\nคำถาม/คำสั่งของผู้ใช้: " + message;

        try {
            String raw = aiProviderService.generateRawResponse(userPrompt, systemPrompt, request.getModel());
            return parseResponse(raw);
        } catch (Exception e) {
            log.error("AI Navigator chat failed", e);
            return AiNavigatorChatResponse.builder()
                    .answer("ขออภัย ระบบ AI ไม่สามารถตอบคำถามได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง")
                    .suggestedRoutes(List.of())
                    .build();
        }
    }

    private String buildSystemPrompt() {
        StringBuilder modulesList = new StringBuilder();
        for (AiModuleRegistry.ModuleDef def : moduleRegistry.all().values()) {
            modulesList.append("- ").append(def.getModuleType()).append(": ").append(def.getLabel())
                    .append(" (ไปหน้ารายการ: ").append(def.getListRoute()).append(")\n");
        }

        return """
                คุณคือ "ผู้ช่วย AI นำทางระบบ" (Global AI Navigator) ของระบบบริหารโครงการ SIC
                หน้าที่ของคุณคือ ตอบคำถามเกี่ยวกับขั้นตอนการใช้งานระบบ (Workflow) และแนะนำ/พาผู้ใช้ไปยังหน้าที่ต้องการเท่านั้น
                ห้ามกรอกฟอร์มหรือสร้างข้อมูลเอง หน้าที่ของคุณคือ "นำทาง" ไม่ใช่ "กรอกข้อมูล"

                ความรู้เรื่อง Workflow ของระบบ:
                %s

                รายชื่อโมดูลที่รู้จักและเส้นทางหน้ารายการ:
                %s

                กติกาการตอบ:
                1. ตอบเป็นภาษาไทยเสมอ สุภาพ กระชับ ตรงประเด็น
                2. ตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่นนอก ```json ``` block โดยมีโครงสร้างดังนี้:
                {
                  "answer": "คำตอบข้อความสำหรับผู้ใช้",
                  "suggestedRoutes": [ { "label": "ชื่อปุ่ม/หน้า", "path": "เส้นทางจริงจากรายชื่อโมดูลด้านบนเท่านั้น" } ],
                  "intentModuleType": "รหัสโมดูล (ตัวพิมพ์ใหญ่) ถ้าผู้ใช้ต้องการ 'สร้าง/เพิ่ม' ข้อมูลใหม่ในโมดูลนั้น มิฉะนั้นให้เป็น null"
                }
                3. suggestedRoutes ต้องใช้ path จากรายชื่อโมดูลด้านบนเท่านั้น ห้ามสร้าง path เอง
                4. ถ้าผู้ใช้ถามคำถามทั่วไปที่ไม่เกี่ยวกับการนำทาง ให้ตอบด้วยความรู้ทั่วไปเกี่ยวกับ Project Management ได้ตามสมควร แต่ suggestedRoutes และ intentModuleType เป็น null/[] ได้
                """.formatted(WORKFLOW_KB, modulesList.toString());
    }

    private AiNavigatorChatResponse parseResponse(String raw) {
        if (raw == null || raw.isBlank() || raw.trim().equals("{}")) {
            return AiNavigatorChatResponse.builder()
                    .answer("ขออภัย ไม่สามารถประมวลผลคำตอบได้ กรุณาลองใหม่")
                    .suggestedRoutes(List.of())
                    .build();
        }

        String jsonStr = raw;
        Matcher matcher = JSON_PATTERN.matcher(raw);
        if (matcher.find()) {
            jsonStr = matcher.group(1).trim();
        } else {
            int start = raw.indexOf('{');
            int end = raw.lastIndexOf('}');
            if (start >= 0 && end > start) {
                jsonStr = raw.substring(start, end + 1).trim();
            }
        }

        try {
            JsonNode root = objectMapper.readTree(jsonStr);
            String answer = root.path("answer").asText(raw);

            List<AiRouteSuggestionDto> routes = new ArrayList<>();
            if (root.path("suggestedRoutes").isArray()) {
                for (JsonNode r : root.path("suggestedRoutes")) {
                    String label = r.path("label").asText(null);
                    String path = r.path("path").asText(null);
                    if (label != null && path != null) {
                        routes.add(AiRouteSuggestionDto.builder().label(label).path(path).build());
                    }
                }
            }

            String intentModuleType = root.path("intentModuleType").isNull() ? null
                    : root.path("intentModuleType").asText(null);

            String openBatchModuleType = null;
            String openBatchRoute = null;
            AiModuleRegistry.ModuleDef def = moduleRegistry.get(intentModuleType);
            if (def != null) {
                openBatchModuleType = def.getModuleType();
                openBatchRoute = def.getCreateRoute();
            }

            return AiNavigatorChatResponse.builder()
                    .answer(answer)
                    .suggestedRoutes(routes)
                    .openBatchModuleType(openBatchModuleType)
                    .openBatchRoute(openBatchRoute)
                    .build();
        } catch (Exception e) {
            log.warn("Failed to parse navigator JSON response, returning raw text. Raw: {}", raw);
            return AiNavigatorChatResponse.builder()
                    .answer(raw)
                    .suggestedRoutes(List.of())
                    .build();
        }
    }
}
