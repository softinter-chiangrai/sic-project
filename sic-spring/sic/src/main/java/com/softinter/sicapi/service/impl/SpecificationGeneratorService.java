package com.softinter.sicapi.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.request.GenerateSpecDraftRequest;
import com.softinter.sicapi.dto.response.SpecificationDraft;
import com.softinter.sicapi.entity.pm.PmDiagramTab;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.repository.pm.PmDiagramTabRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.service.PmAiProviderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
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
        GenerateSpecDraftRequest request = new GenerateSpecDraftRequest();
        request.setRequirementId(requirementId);
        request.setDiagramId(diagramId);
        return generateDraft(request);
    }

    public SpecificationDraft generateDraft(GenerateSpecDraftRequest request) {
        PmRequirement requirement = null;
        if (request.getRequirementId() != null) {
            requirement = requirementRepository.findById(request.getRequirementId()).orElse(null);
        }

        PmDiagramTab diagram = null;
        if (request.getDiagramId() != null) {
            diagram = diagramRepository.findById(request.getDiagramId()).orElse(null);
        }

        String prompt = buildPrompt(requirement, diagram, request.getPrompt(), request.getSpecificationType());
        String systemPrompt = """
                You are a Lead Software Architect and Senior System Analyst with 15+ years of experience.
                Your task is to analyze requirements, diagrams, and user descriptions to generate a comprehensive, highly accurate Software Specification Document in JSON format.
                """;

        String aiResponse = aiProviderService.generateRawResponse(prompt, systemPrompt);
        SpecificationDraft draft = parseAiResponse(aiResponse);

        if (request.getSpecificationType() != null && !request.getSpecificationType().isBlank()) {
            draft.setSpecificationType(request.getSpecificationType());
        }

        // Generate rich HTML for Tiptap editor
        draft.setGeneratedHtmlDescription(buildHtmlDescription(draft));

        return draft;
    }

    private String buildPrompt(PmRequirement req, PmDiagramTab diagram, String customPrompt, String specType) {
        StringBuilder sb = new StringBuilder();
        sb.append("Please generate a detailed Software Specification Document.\n\n");

        if (specType != null && !specType.isBlank()) {
            sb.append("**Specification Type:** ").append(specType).append("\n");
        }

        if (req != null) {
            sb.append("**Requirement Information:**\n")
              .append("- Code: ").append(req.getRequirementCode()).append("\n")
              .append("- Title: ").append(req.getTitle()).append("\n")
              .append("- Description: ").append(req.getDescription() != null ? req.getDescription() : "").append("\n")
              .append("- Acceptance Criteria: ").append(req.getAcceptanceCriteria() != null ? req.getAcceptanceCriteria() : "").append("\n")
              .append("- Priority: ").append(req.getPriority() != null ? req.getPriority() : "Medium").append("\n\n");
        }

        if (diagram != null) {
            String diagramType = diagram.getDiagramType() != null ? diagram.getDiagramType() : "Diagram";
            String script = diagram.getMermaidScript() != null ? diagram.getMermaidScript() : "";
            sb.append("**Diagram Information:**\n")
              .append("- Name: ").append(diagram.getName() != null ? diagram.getName() : "").append("\n")
              .append("- Type: ").append(diagramType).append("\n")
              .append("- Script (Mermaid):\n").append(script).append("\n\n");
        }

        if (customPrompt != null && !customPrompt.isBlank()) {
            sb.append("**User Specific Instructions / Topic:**\n")
              .append(customPrompt).append("\n\n");
        }

        sb.append("""
                **Output Requirement:**
                Return a valid JSON object ONLY. Do NOT wrap in conversational text.
                Language for content should be primarily in Thai (with English technical terms where appropriate).

                **JSON Schema:**
                ```json
                {
                  "title": "ชื่อของ Specification (ภาษาไทย/อังกฤษ)",
                  "objective": "วัตถุประสงค์ของการทำงาน",
                  "scope": "ขอบเขตการทำงาน",
                  "description": "คำอธิบายภาพรวมของระบบ",
                  "priority": "High / Medium / Low",
                  "estimatedManday": 3,
                  "screens": [
                    { "screenName": "ชื่อหน้าจอ", "description": "หน้าที่ของหน้าจอ", "navigation": "เส้นทางการเข้าถึงหน้าจอ" }
                  ],
                  "fields": [
                    { "fieldName": "ชื่อฟิลด์", "dataType": "String/Integer/Boolean/Date/UUID", "isRequired": true, "maxLength": 50, "description": "คำอธิบายการใช้งาน" }
                  ],
                  "validations": [
                    { "validationType": "Required/Format/Uniqueness/Range", "rule": "เงื่อนไขการตรวจสอบ", "errorMessage": "ข้อความแจ้งเตือนเมื่อผิดพลาด" }
                  ],
                  "businessRules": [
                    { "ruleName": "ชื่อกฎ", "description": "รายละเอียดเงื่อนไขและขั้นตอน", "severity": "High/Medium/Low" }
                  ],
                  "apis": [
                    { "method": "GET/POST/PUT/DELETE", "url": "/api/v1/...", "description": "คำอธิบาย API", "authentication": "JWT/Bearer" }
                  ]
                }
                ```
                """);

        return sb.toString();
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
            // Return fallback draft rather than crashing
            SpecificationDraft fallback = new SpecificationDraft();
            fallback.setTitle("Generated Specification");
            fallback.setObjective("Specification generated from prompt");
            fallback.setScope("System scope");
            fallback.setDescription(aiResponse);
            fallback.setPriority("Medium");
            fallback.setEstimatedManday(1);
            return fallback;
        }
    }

    private String buildHtmlDescription(SpecificationDraft draft) {
        StringBuilder html = new StringBuilder();

        // 1. วัตถุประสงค์
        if (draft.getObjective() != null && !draft.getObjective().isBlank()) {
            html.append("<h3>1. วัตถุประสงค์ (Objective)</h3>\n");
            html.append("<p>").append(escapeHtml(draft.getObjective())).append("</p>\n");
        }

        // 2. ขอบเขตของงาน
        if (draft.getScope() != null && !draft.getScope().isBlank()) {
            html.append("<h3>2. ขอบเขตของงาน (Scope)</h3>\n");
            html.append("<p>").append(escapeHtml(draft.getScope())).append("</p>\n");
        }

        // 3. รายละเอียดภาพรวม
        if (draft.getDescription() != null && !draft.getDescription().isBlank()) {
            html.append("<h3>3. รายละเอียดภาพรวม (Description)</h3>\n");
            html.append("<p>").append(escapeHtml(draft.getDescription())).append("</p>\n");
        }

        // 4. รายการหน้าจอ
        if (draft.getScreens() != null && !draft.getScreens().isEmpty()) {
            html.append("<h3>4. ข้อกำหนดหน้าจอ (Screen Specifications)</h3>\n");
            html.append("<ul>\n");
            for (SpecificationDraft.ScreenDto s : draft.getScreens()) {
                html.append("<li><strong>").append(escapeHtml(s.getScreenName())).append("</strong>: ")
                    .append(escapeHtml(s.getDescription()))
                    .append(" <em>(การนำทาง: ").append(escapeHtml(s.getNavigation())).append(")</em></li>\n");
            }
            html.append("</ul>\n");
        }

        // 5. รายการฟิลด์ข้อมูล
        if (draft.getFields() != null && !draft.getFields().isEmpty()) {
            html.append("<h3>5. ข้อกำหนดฟิลด์ข้อมูล (Field Specifications)</h3>\n");
            html.append("<table border=\"1\" style=\"width:100%; border-collapse: collapse; text-align: left;\">\n");
            html.append("<thead><tr style=\"background-color:#f1f5f9;\">")
                .append("<th style=\"padding:6px 10px;\">ฟิลด์</th>")
                .append("<th style=\"padding:6px 10px;\">ประเภท</th>")
                .append("<th style=\"padding:6px 10px;\">จำเป็น</th>")
                .append("<th style=\"padding:6px 10px;\">ความยาวสูงสุด</th>")
                .append("<th style=\"padding:6px 10px;\">คำอธิบาย</th>")
                .append("</tr></thead>\n<tbody>\n");
            for (SpecificationDraft.FieldDto f : draft.getFields()) {
                html.append("<tr>")
                    .append("<td style=\"padding:6px 10px; font-family:monospace;\">").append(escapeHtml(f.getFieldName())).append("</td>")
                    .append("<td style=\"padding:6px 10px;\">").append(escapeHtml(f.getDataType())).append("</td>")
                    .append("<td style=\"padding:6px 10px;\">").append(Boolean.TRUE.equals(f.getIsRequired()) ? "Yes" : "No").append("</td>")
                    .append("<td style=\"padding:6px 10px;\">").append(f.getMaxLength() != null ? f.getMaxLength() : "-").append("</td>")
                    .append("<td style=\"padding:6px 10px;\">").append(escapeHtml(f.getDescription())).append("</td>")
                    .append("</tr>\n");
            }
            html.append("</tbody></table>\n");
        }

        // 6. กฎการตรวจสอบข้อมูล
        if (draft.getValidations() != null && !draft.getValidations().isEmpty()) {
            html.append("<h3>6. กฎการตรวจสอบความถูกต้อง (Validation Rules)</h3>\n");
            html.append("<ul>\n");
            for (SpecificationDraft.ValidationDto v : draft.getValidations()) {
                html.append("<li><strong>[").append(escapeHtml(v.getValidationType())).append("]</strong> ")
                    .append(escapeHtml(v.getRule()))
                    .append(" &rarr; <em>").append(escapeHtml(v.getErrorMessage())).append("</em></li>\n");
            }
            html.append("</ul>\n");
        }

        // 7. กฎทางธุรกิจ
        if (draft.getBusinessRules() != null && !draft.getBusinessRules().isEmpty()) {
            html.append("<h3>7. กฎทางธุรกิจ (Business Rules)</h3>\n");
            html.append("<ul>\n");
            for (SpecificationDraft.BusinessRuleDto b : draft.getBusinessRules()) {
                html.append("<li><strong>").append(escapeHtml(b.getRuleName())).append("</strong> (").append(escapeHtml(b.getSeverity())).append("): ")
                    .append(escapeHtml(b.getDescription())).append("</li>\n");
            }
            html.append("</ul>\n");
        }

        // 8. REST APIs
        if (draft.getApis() != null && !draft.getApis().isEmpty()) {
            html.append("<h3>8. อินเตอร์เฟซ API (RESTful Endpoints)</h3>\n");
            html.append("<table border=\"1\" style=\"width:100%; border-collapse: collapse; text-align: left;\">\n");
            html.append("<thead><tr style=\"background-color:#f1f5f9;\">")
                .append("<th style=\"padding:6px 10px;\">Method</th>")
                .append("<th style=\"padding:6px 10px;\">Endpoint URL</th>")
                .append("<th style=\"padding:6px 10px;\">Auth</th>")
                .append("<th style=\"padding:6px 10px;\">คำอธิบาย</th>")
                .append("</tr></thead>\n<tbody>\n");
            for (SpecificationDraft.ApiDto a : draft.getApis()) {
                html.append("<tr>")
                    .append("<td style=\"padding:6px 10px; font-weight:bold;\">").append(escapeHtml(a.getMethod())).append("</td>")
                    .append("<td style=\"padding:6px 10px; font-family:monospace;\">").append(escapeHtml(a.getUrl())).append("</td>")
                    .append("<td style=\"padding:6px 10px;\">").append(escapeHtml(a.getAuthentication())).append("</td>")
                    .append("<td style=\"padding:6px 10px;\">").append(escapeHtml(a.getDescription())).append("</td>")
                    .append("</tr>\n");
            }
            html.append("</tbody></table>\n");
        }

        return html.toString();
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }
}