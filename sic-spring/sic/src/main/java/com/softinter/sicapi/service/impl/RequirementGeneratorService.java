package com.softinter.sicapi.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.request.GenerateRequirementDraftRequest;
import com.softinter.sicapi.dto.response.RequirementDraft;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.service.PmAiProviderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class RequirementGeneratorService {

    private final PmAiProviderService aiProviderService;
    private final PmCustomerProjectRepository projectRepository;
    private final ObjectMapper objectMapper;

    private static final Pattern JSON_PATTERN = Pattern.compile("```json\\s*([\\s\\S]*?)```");

    public RequirementDraft generateDraft(GenerateRequirementDraftRequest request) {
        PmCustomerProject project = null;
        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId()).orElse(null);
        }

        String prompt = buildPrompt(project, request.getTitle(), request.getPrompt(), request.getRequirementType());
        String systemPrompt = """
                You are a Principal Business Analyst and Lead System Analyst with 15+ years of experience in enterprise software development.
                Your task is to analyze user prompts and project contexts to generate a comprehensive, professional, well-structured Software Requirement in JSON format.
                
                RULES:
                1. Respond strictly in valid JSON format.
                2. Do NOT wrap with any text outside the ```json ``` block.
                3. The JSON structure MUST be:
                {
                    "title": "Clear, concise, professional requirement title",
                    "description": "Comprehensive HTML description (use <p>, <ul>, <li>, <strong>, <h3> for rich formatting suitable for rich-text editors)",
                    "acceptanceCriteria": "Given-When-Then or clear bulleted criteria formatted in HTML (<p>, <ul>, <li>, <strong>)",
                    "businessValue": "Direct business impact, ROI, efficiency, or compliance value formatted in HTML (<p>, <ul>, <li>)",
                    "requirementType": "FUNCTIONAL or NON_FUNCTIONAL",
                    "priority": "HIGH, MEDIUM, or LOW"
                }
                4. Ensure the output is directly applicable, testable, unambiguous, and professional.
                5. If user wrote prompt in Thai, respond in Thai (except technical terms/standards). If in English, respond in English.
                """;

        String aiResponse = aiProviderService.generateRawResponse(prompt, systemPrompt);
        RequirementDraft draft = parseAiResponse(aiResponse);

        if (request.getRequirementType() != null && !request.getRequirementType().isBlank()) {
            draft.setRequirementType(request.getRequirementType());
        }
        if (draft.getPriority() == null || draft.getPriority().isBlank()) {
            draft.setPriority("MEDIUM");
        }
        if (draft.getRequirementType() == null || draft.getRequirementType().isBlank()) {
            draft.setRequirementType("FUNCTIONAL");
        }

        return draft;
    }

    private String buildPrompt(PmCustomerProject project, String customTitle, String customPrompt, String requirementType) {
        StringBuilder sb = new StringBuilder();
        sb.append("Please generate a detailed, professional Software Requirement.\n\n");

        if (project != null) {
            sb.append("**Project Context:**\n")
              .append("- Project Name: ").append(project.getProjectName() != null ? project.getProjectName() : "").append("\n")
              .append("- Project Code: ").append(project.getProjectCode() != null ? project.getProjectCode() : "").append("\n")
              .append("- Description: ").append(project.getDescription() != null ? project.getDescription() : "").append("\n\n");
        }

        if (requirementType != null && !requirementType.isBlank()) {
            sb.append("- Requested Requirement Type: ").append(requirementType).append("\n");
        }

        if (customTitle != null && !customTitle.isBlank()) {
            sb.append("- Draft Title / Feature Idea: ").append(customTitle).append("\n");
        }

        if (customPrompt != null && !customPrompt.isBlank()) {
            sb.append("- User Specific Requirements / Prompt: ").append(customPrompt).append("\n");
        } else if (customTitle != null && !customTitle.isBlank()) {
            sb.append("- Prompt: Generate full requirement specifications based on the draft title.\n");
        } else {
            sb.append("- Prompt: Generate a standard core business requirement.\n");
        }

        return sb.toString();
    }

    private RequirementDraft parseAiResponse(String aiResponse) {
        if (aiResponse == null || aiResponse.isBlank()) {
            return createFallbackDraft("AI response is empty");
        }

        String json = extractJson(aiResponse);
        try {
            return objectMapper.readValue(json, RequirementDraft.class);
        } catch (Exception e) {
            log.error("Failed to parse Requirement AI JSON: {}\nRaw: {}", e.getMessage(), aiResponse);
            return createFallbackDraft(aiResponse);
        }
    }

    private String extractJson(String text) {
        Matcher matcher = JSON_PATTERN.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start != -1 && end != -1 && end > start) {
            return text.substring(start, end + 1).trim();
        }
        return text.trim();
    }

    private RequirementDraft createFallbackDraft(String raw) {
        RequirementDraft draft = new RequirementDraft();
        draft.setTitle("Generated Requirement Draft");
        draft.setDescription("<p>" + (raw != null ? raw.replace("\n", "<br/>") : "") + "</p>");
        draft.setAcceptanceCriteria("<p>- System functions as expected</p>");
        draft.setBusinessValue("<p>- Enhances system usability and operations</p>");
        draft.setRequirementType("FUNCTIONAL");
        draft.setPriority("MEDIUM");
        return draft;
    }
}
