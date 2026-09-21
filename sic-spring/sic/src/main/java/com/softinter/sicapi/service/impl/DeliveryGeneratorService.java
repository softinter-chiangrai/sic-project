package com.softinter.sicapi.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.request.GenerateDeliveryDraftRequest;
import com.softinter.sicapi.dto.response.DeliveryDraft;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.service.PmAiProviderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryGeneratorService {

    private final PmAiProviderService aiProviderService;
    private final PmCustomerProjectRepository projectRepository;
    private final ObjectMapper objectMapper;

    private static final Pattern JSON_PATTERN = Pattern.compile("```json\\s*([\\s\\S]*?)```");

    public DeliveryDraft generateDraft(GenerateDeliveryDraftRequest request) {
        PmCustomerProject project = null;
        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId()).orElse(null);
        }

        String prompt = buildPrompt(project, request.getDeliveryTitle(), request.getDeliveryType(), request.getPrompt());
        String systemPrompt = """
                You are a Senior Project Manager and Quality Assurance Lead with 15+ years of experience in enterprise software delivery and sign-off.
                Your task is to generate a comprehensive, professional Software Delivery & Acceptance document in JSON format.
                
                RULES:
                1. Respond strictly in valid JSON format.
                2. Do NOT wrap with any text outside the ```json ``` block.
                3. Leave deliveryType and deliveryVersion as null unless specifically provided by the user. Do NOT invent delivery types or versions - users will specify these themselves.
                4. The JSON structure MUST be:
                {
                    "deliveryTitle": "Clear, professional delivery title (e.g. เอกสารส่งมอบระบบและงวดงาน Phase 1)",
                    "deliveryType": null,
                    "deliveryVersion": null,
                    "deliverySummary": "Comprehensive HTML delivery overview and scope (<p>, <ul>, <li>, <strong>, <h3>)",
                    "releaseNote": "Key features, bug fixes, changes, deployment instructions formatted in HTML (<p>, <ul>, <li>)",
                    "checklists": [
                        {
                            "checklistName": "Checklist item name (e.g. ตรวจสอบ Source Code & Unit Test Coverage)",
                            "notes": "Criteria or verification notes",
                            "isPassed": true
                        }
                    ],
                    "items": [
                        {
                            "itemName": "Deliverable item name (e.g. Source Code Package / User Manual PDF)",
                            "itemType": "SOURCE_CODE, DOCUMENT, DATABASE, API, CONFIG, or OTHER",
                            "description": "Item description and details"
                        }
                    ]
                }
                5. Ensure professional tone. If prompt in Thai, respond in Thai.
                """;

        String aiResponse = aiProviderService.generateRawResponse(prompt, systemPrompt, request);
        DeliveryDraft draft = parseAiResponse(aiResponse);

        draft.setDeliveryType(request.getDeliveryType() != null && !request.getDeliveryType().isBlank() ? request.getDeliveryType() : null);
        draft.setDeliveryVersion(null);
        if (draft.getChecklists() == null) {
            draft.setChecklists(new ArrayList<>());
        }
        if (draft.getItems() == null) {
            draft.setItems(new ArrayList<>());
        }

        return draft;
    }

    private String buildPrompt(PmCustomerProject project, String customTitle, String deliveryType, String customPrompt) {
        StringBuilder sb = new StringBuilder();
        sb.append("Please generate a detailed Software Delivery Document Draft.\n\n");

        if (project != null) {
            sb.append("**Project Context:**\n")
              .append("- Project Name: ").append(project.getProjectName() != null ? project.getProjectName() : "").append("\n")
              .append("- Project Code: ").append(project.getProjectCode() != null ? project.getProjectCode() : "").append("\n")
              .append("- Description: ").append(project.getDescription() != null ? project.getDescription() : "").append("\n\n");
        }

        if (deliveryType != null && !deliveryType.isBlank()) {
            sb.append("- Delivery Type: ").append(deliveryType).append("\n");
        }
        if (customTitle != null && !customTitle.isBlank()) {
            sb.append("- Draft Delivery Title: ").append(customTitle).append("\n");
        }
        if (customPrompt != null && !customPrompt.isBlank()) {
            sb.append("- User Specific Requirements: ").append(customPrompt).append("\n");
        } else {
            sb.append("- Prompt: Generate complete release deliverables, acceptance checklist, and release notes.\n");
        }

        return sb.toString();
    }

    private DeliveryDraft parseAiResponse(String aiResponse) {
        if (aiResponse == null || aiResponse.isBlank() || aiResponse.trim().equals("{}")) {
            return fallbackDraft("No response from AI");
        }

        String jsonContent = aiResponse.trim();
        Matcher matcher = JSON_PATTERN.matcher(jsonContent);
        if (matcher.find()) {
            jsonContent = matcher.group(1).trim();
        }

        try {
            DeliveryDraft draft = objectMapper.readValue(jsonContent, DeliveryDraft.class);
            if (draft == null || (draft.getDeliveryTitle() == null && draft.getDeliverySummary() == null && draft.getReleaseNote() == null)) {
                return fallbackDraft(aiResponse);
            }
            return draft;
        } catch (Exception e) {
            log.warn("Failed to parse AI JSON response for Delivery, attempting raw extraction: {}", e.getMessage());
            return fallbackDraft(aiResponse);
        }
    }

    private DeliveryDraft fallbackDraft(String text) {
        return DeliveryDraft.builder()
                .deliveryTitle("เอกสารส่งมอบงาน (AI Draft)")
                .deliveryType(null)
                .deliveryVersion(null)
                .deliverySummary("<p>" + text.replace("\n", "<br/>") + "</p>")
                .releaseNote("<p>รายละเอียดการส่งมอบและหมายเหตุประกอบ</p>")
                .checklists(new ArrayList<>())
                .items(new ArrayList<>())
                .build();
    }
}
