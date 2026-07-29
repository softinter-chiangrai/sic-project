package com.softinter.sicapi.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.response.SpecificationDraft;
import com.softinter.sicapi.entity.pm.PmDiagramTab;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.repository.pm.PmDiagramTabRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.service.PmAiProviderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpecificationGeneratorService {

    private final PmAiProviderService aiProviderService;
    private final PmRequirementRepository requirementRepository;
    private final PmDiagramTabRepository diagramRepository;
    private final ObjectMapper objectMapper;

    private static final Pattern JSON_PATTERN = Pattern.compile("```json\\s*([\\s\\S]*?)```");

    public SpecificationDraft generateDraft(UUID requirementId, UUID diagramId) {
        PmRequirement requirement = requirementRepository.findById(requirementId)
                .orElseThrow(() -> new RuntimeException("Requirement not found"));

        PmDiagramTab diagram = diagramRepository.findById(diagramId)
                .orElseThrow(() -> new RuntimeException("Diagram not found"));

        String prompt = buildPrompt(requirement, diagram);
        String aiResponse = aiProviderService.generateResponse(prompt, "");
        return parseAiResponse(aiResponse);
    }

    private String buildPrompt(PmRequirement req, PmDiagramTab diagram) {
        String diagramType = diagram.getDiagramType() != null ? diagram.getDiagramType() : "Diagram";
        String script = diagram.getMermaidScript() != null ? diagram.getMermaidScript() : "";

        return """
                You are a Senior System Analyst with 10+ years of experience.
                Generate a complete Specification Document from the given Requirement and Diagram.

                **Requirement:**
                - Code: %s
                - Title: %s
                - Description: %s
                - Acceptance Criteria: %s
                - Priority: %s

                **Diagram Type:** %s
                **Diagram Script (Mermaid):**
                %s

                **Output MUST be valid JSON ONLY.**
                Do NOT include any text outside the JSON block.

                **JSON Structure:**
                {
                  "title": "Specification title",
                  "objective": "Objective of this specification",
                  "scope": "Scope of work",
                  "description": "Detailed description",
                  "priority": "High/Medium/Low",
                  "estimatedManday": 0,
                  "screens": [
                    { "screenName": "Screen name", "description": "Description", "navigation": "Navigation flow" }
                  ],
                  "fields": [
                    { "fieldName": "field_name", "dataType": "String/Integer/Boolean/Date", "isRequired": true, "maxLength": 50, "description": "Field description" }
                  ],
                  "validations": [
                    { "validationType": "Required/Format/Uniqueness/Range", "rule": "Rule description", "errorMessage": "Error message" }
                  ],
                  "businessRules": [
                    { "ruleName": "Rule name", "description": "Rule description", "severity": "High/Medium/Low" }
                  ],
                  "apis": [
                    { "method": "GET/POST/PUT/DELETE", "url": "/api/path", "description": "API description", "authentication": "JWT/Basic/None" }
                  ]
                }

                **Instructions:**
                1. Analyze the Diagram to identify entities, fields, and relationships.
                2. Derive Screen Specifications from use cases or data flows.
                3. Define validation rules based on field constraints.
                4. Estimate Manday reasonably.
                5. Generate API endpoints following RESTful patterns.
                """.formatted(
                req.getRequirementCode(),
                req.getTitle(),
                req.getDescription() != null ? req.getDescription() : "",
                req.getAcceptanceCriteria() != null ? req.getAcceptanceCriteria() : "",
                req.getPriority() != null ? req.getPriority() : "Medium",
                diagramType,
                script
        );
    }

    private SpecificationDraft parseAiResponse(String aiResponse) {
        try {
            Matcher matcher = JSON_PATTERN.matcher(aiResponse);
            String json;
            if (matcher.find()) {
                json = matcher.group(1).trim();
            } else {
                json = aiResponse.trim();
            }
            return objectMapper.readValue(json, SpecificationDraft.class);
        } catch (Exception e) {
            log.error("Failed to parse AI response: {}", aiResponse, e);
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage());
        }
    }
}