package com.softinter.sicapi.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.request.GenerateTestScenarioDraftRequest;
import com.softinter.sicapi.dto.response.TestScenarioDraftResponse;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.entity.pm.PmSpecification;
import com.softinter.sicapi.entity.pm.PmTask;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
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
public class TestScenarioGeneratorService {

    private final PmAiProviderService aiProviderService;
    private final PmTaskRepository taskRepository;
    private final PmRequirementRepository requirementRepository;
    private final ObjectMapper objectMapper;

    private static final Pattern JSON_PATTERN = Pattern.compile("```json\\s*([\\s\\S]*?)```");

    @Transactional(readOnly = true)
    public TestScenarioDraftResponse generateDraft(GenerateTestScenarioDraftRequest request) {
        PmTask task = null;
        PmSpecification spec = null;
        PmRequirement req = null;

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

        String prompt = buildPrompt(task, spec, req, request.getScenarioName(), request.getPrompt());
        String systemPrompt = """
                You are a Lead QA Architect and Senior Test Specialist.
                Your task is to analyze user tasks, requirements, and specifications to generate a comprehensive, professional Test Scenario in JSON format.
                Ensure the description is rich with HTML tags suitable for rich-text rendering (e.g. <p>...</p>, <ul><li>...</li></ul>, <strong>...</strong>).
                """;

        String aiResponse = aiProviderService.generateRawResponse(prompt, systemPrompt);
        TestScenarioDraftResponse draft = parseAiResponse(aiResponse);

        if (draft.getPriority() == null || draft.getPriority().isBlank()) {
            draft.setPriority("Medium");
        }

        if (draft.getScenarioCode() == null || draft.getScenarioCode().isBlank()) {
            draft.setScenarioCode("SC-" + (int)(Math.random() * 900 + 100));
        }

        return draft;
    }

    private String buildPrompt(PmTask task, PmSpecification spec, PmRequirement req, String customName, String customPrompt) {
        StringBuilder sb = new StringBuilder();
        sb.append("Please generate a detailed, professional Test Scenario Document.\n\n");

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

        if (customName != null && !customName.isBlank()) {
            sb.append("**Target Scenario Name:** ").append(customName).append("\n\n");
        }

        if (customPrompt != null && !customPrompt.isBlank()) {
            sb.append("**Additional User Instructions:**\n").append(customPrompt).append("\n\n");
        }

        sb.append("""
                **Output Requirement:**
                Return a valid JSON object ONLY. Do NOT wrap in conversational text.
                Language for scenario content should be primarily in Thai (with English technical terms where appropriate).

                **JSON Schema:**
                ```json
                {
                  "scenarioCode": "SC-001",
                  "scenarioName": "ชื่อ Test Scenario (ครอบคลุมชุดการทดสอบ เช่น 'ทดสอบกระบวนการสั่งซื้อสินค้าและการชำระเงิน')",
                  "priority": "High / Medium / Low",
                  "description": "<p><strong>วัตถุประสงค์และขอบเขต:</strong> เพื่อทดสอบการทำงานของระบบในการจัดการ...</p><ul><li>ทดสอบการแสดงผลหน้าจอและ Validation</li><li>ทดสอบความถูกต้องของการคำนวณ</li><li>ทดสอบการบันทึกและส่งแจ้งเตือน</li></ul>"
                }
                ```
                """);

        return sb.toString();
    }

    private TestScenarioDraftResponse parseAiResponse(String aiResponse) {
        try {
            Matcher matcher = JSON_PATTERN.matcher(aiResponse);
            String json;
            if (matcher.find()) {
                json = matcher.group(1).trim();
            } else {
                json = aiResponse.trim();
            }
            return objectMapper.readValue(json, TestScenarioDraftResponse.class);
        } catch (Exception e) {
            log.error("Failed to parse AI test scenario response: {}", aiResponse, e);
            TestScenarioDraftResponse fallback = new TestScenarioDraftResponse();
            fallback.setScenarioCode("SC-" + (int)(Math.random() * 900 + 100));
            fallback.setScenarioName("Generated Test Scenario");
            fallback.setPriority("Medium");
            fallback.setDescription("<p>กลุ่มการทดสอบที่สร้างโดย AI เพื่อรองรับการทดสอบระบบ</p>");
            return fallback;
        }
    }
}
