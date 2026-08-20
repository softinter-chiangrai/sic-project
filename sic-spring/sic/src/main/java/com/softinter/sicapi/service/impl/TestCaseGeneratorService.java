package com.softinter.sicapi.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.request.GenerateTestCaseDraftRequest;
import com.softinter.sicapi.dto.response.TestCaseDraftResponse;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.entity.pm.PmSpecification;
import com.softinter.sicapi.entity.pm.PmTask;
import com.softinter.sicapi.entity.pm.PmTestScenario;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationRepository;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.pm.PmTestScenarioRepository;
import com.softinter.sicapi.service.PmAiProviderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class TestCaseGeneratorService {

    private final PmAiProviderService aiProviderService;
    private final PmTaskRepository taskRepository;
    private final PmRequirementRepository requirementRepository;
    private final PmSpecificationRepository specificationRepository;
    private final PmTestScenarioRepository scenarioRepository;
    private final ObjectMapper objectMapper;

    private static final Pattern JSON_PATTERN = Pattern.compile("```json\\s*([\\s\\S]*?)```");

    @Transactional(readOnly = true)
    public TestCaseDraftResponse generateDraft(GenerateTestCaseDraftRequest request) {
        PmTask task = null;
        PmSpecification spec = null;
        PmRequirement req = null;
        PmTestScenario scenario = null;

        if (request.getTaskId() != null) {
            task = taskRepository.findById(request.getTaskId()).orElse(null);
            if (task != null && task.getSpecification() != null) {
                spec = task.getSpecification();
                if (spec.getRequirement() != null) {
                    req = spec.getRequirement();
                }
            }
        }

        if (req == null && request.getRequirementId() != null) {
            req = requirementRepository.findById(request.getRequirementId()).orElse(null);
        }

        if (request.getScenarioId() != null) {
            scenario = scenarioRepository.findById(request.getScenarioId()).orElse(null);
        }

        String prompt = buildPrompt(task, spec, req, scenario, request.getTitle(), request.getPrompt());
        String systemPrompt = """
                You are a Lead QA Engineer and Software Testing Specialist with 15+ years of experience.
                Your task is to analyze user tasks, requirements, specifications, and scenarios to generate comprehensive, professional Software Test Cases in JSON format.
                Ensure test steps and expected results are formatted with HTML tags suitable for rich-text rendering (e.g. <ol><li>...</li></ol>, <p>...</p>, <strong>...</strong>).
                """;

        String aiResponse = aiProviderService.generateRawResponse(prompt, systemPrompt);
        TestCaseDraftResponse draft = parseAiResponse(aiResponse);

        if (draft.getPriority() == null || draft.getPriority().isBlank()) {
            draft.setPriority("Medium");
        }

        // Format HTML for testStep if not already HTML
        if (draft.getTestStep() != null && !draft.getTestStep().contains("<")) {
            draft.setTestStep(convertTextToHtmlOrderedList(draft.getTestStep()));
        }

        // Format HTML for expectedResult if not already HTML
        if (draft.getExpectedResult() != null && !draft.getExpectedResult().contains("<")) {
            draft.setExpectedResult(convertTextToHtml(draft.getExpectedResult()));
        }

        return draft;
    }

    private String buildPrompt(PmTask task, PmSpecification spec, PmRequirement req, PmTestScenario scenario, String customTitle, String customPrompt) {
        StringBuilder sb = new StringBuilder();
        sb.append("Please generate a detailed, professional Software Test Case.\n\n");

        if (scenario != null) {
            sb.append("**Test Scenario Context:**\n")
              .append("- Scenario Name: ").append(scenario.getScenarioName()).append("\n")
              .append("- Description: ").append(scenario.getDescription() != null ? scenario.getDescription() : "").append("\n\n");
        }

        if (task != null) {
            sb.append("**Task Information:**\n")
              .append("- Code: ").append(task.getTaskCode()).append("\n")
              .append("- Name: ").append(task.getTaskName()).append("\n")
              .append("- Description: ").append(task.getDescription() != null ? task.getDescription() : "").append("\n\n");
        }

        if (spec != null) {
            sb.append("**Specification Information:**\n")
              .append("- Title: ").append(spec.getTitle()).append("\n")
              .append("- Type: ").append(spec.getSpecificationType() != null ? spec.getSpecificationType() : "").append("\n")
              .append("- Description: ").append(spec.getDescription() != null ? spec.getDescription() : "").append("\n\n");
        }

        if (req != null) {
            sb.append("**Requirement Information:**\n")
              .append("- Title: ").append(req.getTitle()).append("\n")
              .append("- Acceptance Criteria: ").append(req.getAcceptanceCriteria() != null ? req.getAcceptanceCriteria() : "").append("\n\n");
        }

        if (customTitle != null && !customTitle.isBlank()) {
            sb.append("**Target Test Case Title / Goal:** ").append(customTitle).append("\n\n");
        }

        if (customPrompt != null && !customPrompt.isBlank()) {
            sb.append("**Additional User Instructions:**\n").append(customPrompt).append("\n\n");
        }

        sb.append("""
                **Output Requirement:**
                Return a valid JSON object ONLY. Do NOT wrap in conversational text.
                Language for test case content should be primarily in Thai (with English technical terms where appropriate).

                **JSON Schema:**
                ```json
                {
                  "title": "หัวข้อ Test Case (ชัดเจนและระบุเป้าหมายการทดสอบ เช่น 'ทดสอบการบันทึกข้อมูลเมื่อกรอกครบถ้วน')",
                  "priority": "High / Medium / Low",
                  "testStep": "<ol><li>เปิดหน้าจอ...</li><li>กรอกข้อมูล...</li><li>คลิกปุ่มบันทึก</li></ol>",
                  "expectedResult": "<p>1. ระบบบันทึกข้อมูลสำเร็จและแสดง Alert ยืนยัน</p><p>2. ข้อมูลปรากฏในตารางรายการอย่างถูกต้อง</p>"
                }
                ```
                """);

        return sb.toString();
    }

    private TestCaseDraftResponse parseAiResponse(String aiResponse) {
        try {
            Matcher matcher = JSON_PATTERN.matcher(aiResponse);
            String json;
            if (matcher.find()) {
                json = matcher.group(1).trim();
            } else {
                json = aiResponse.trim();
            }
            return objectMapper.readValue(json, TestCaseDraftResponse.class);
        } catch (Exception e) {
            log.error("Failed to parse AI test case response: {}", aiResponse, e);
            TestCaseDraftResponse fallback = new TestCaseDraftResponse();
            fallback.setTitle("Generated Test Case");
            fallback.setPriority("Medium");
            fallback.setTestStep("<ol><li>เปิดหน้าจอการทำงาน</li><li>กรอกข้อมูลเพื่อทดสอบ</li><li>ตรวจสอบผลลัพธ์</li></ol>");
            fallback.setExpectedResult("<p>ระบบทำงานถูกต้องตามเงื่อนไขที่กำหนด</p>");
            return fallback;
        }
    }

    private String convertTextToHtmlOrderedList(String text) {
        if (text == null || text.isBlank()) return "<p>-</p>";
        String[] lines = text.split("\n");
        StringBuilder sb = new StringBuilder("<ol>");
        for (String line : lines) {
            String trimmed = line.trim();
            if (!trimmed.isEmpty()) {
                trimmed = trimmed.replaceFirst("^[0-9]+[.)]\\s*", "");
                sb.append("<li>").append(trimmed).append("</li>");
            }
        }
        sb.append("</ol>");
        return sb.toString();
    }

    private String convertTextToHtml(String text) {
        if (text == null || text.isBlank()) return "<p>-</p>";
        String[] lines = text.split("\n");
        StringBuilder sb = new StringBuilder();
        for (String line : lines) {
            String trimmed = line.trim();
            if (!trimmed.isEmpty()) {
                sb.append("<p>").append(trimmed).append("</p>");
            }
        }
        return sb.toString();
    }
}
