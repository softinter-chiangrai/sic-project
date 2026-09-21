package com.softinter.sicapi.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.request.GenerateMaTicketDraftRequest;
import com.softinter.sicapi.dto.response.MaTicketDraft;
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
public class MaTicketGeneratorService {

    private final PmAiProviderService aiProviderService;
    private final PmCustomerProjectRepository projectRepository;
    private final ObjectMapper objectMapper;

    private static final Pattern JSON_PATTERN = Pattern.compile("```json\\s*([\\s\\S]*?)```");

    public MaTicketDraft generateDraft(GenerateMaTicketDraftRequest request) {
        PmCustomerProject project = null;
        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId()).orElse(null);
        }

        String prompt = buildPrompt(project, request.getTitle(), request.getTicketType(), request.getSeverity(), request.getPrompt());
        String systemPrompt = """
                You are a Lead IT Service Management (ITSM) Specialist and Level 3 Support Lead with 15+ years of experience in enterprise software maintenance and incident management (ITIL aligned).
                Your task is to analyze user prompts and generate a comprehensive, professional Maintenance & Support Ticket (MA Ticket) in JSON format.
                
                RULES:
                1. Respond strictly in valid JSON format.
                2. Do NOT wrap with any text outside the ```json ``` block.
                3. Leave ticketType and severity as null unless specifically provided by the user. Do NOT invent ticket types or severity levels - users will select these themselves.
                4. The JSON structure MUST be:
                {
                    "title": "Clear, professional, concise ticket title (e.g. ปัญหาการเชื่อมต่อระบบ Payment Gateway ขัดข้อง)",
                    "ticketType": null,
                    "severity": null,
                    "description": "Comprehensive HTML description covering problem symptoms, reproduction steps, expected vs actual behavior, and affected components formatted in HTML (<p>, <ul>, <li>, <strong>, <h3>)",
                    "resolutionSummary": "Root cause analysis, workaround, or proposed technical resolution steps formatted in HTML (<p>, <ul>, <li>, <strong>)"
                }
                5. If user prompt is in Thai, respond in Thai.
                """;

        String aiResponse = aiProviderService.generateRawResponse(prompt, systemPrompt, request);
        MaTicketDraft draft = parseAiResponse(aiResponse);

        draft.setTicketType(request.getTicketType() != null && !request.getTicketType().isBlank() ? request.getTicketType() : null);
        draft.setSeverity(request.getSeverity() != null && !request.getSeverity().isBlank() ? request.getSeverity() : null);

        return draft;
    }

    private String buildPrompt(PmCustomerProject project, String customTitle, String ticketType, String severity, String customPrompt) {
        StringBuilder sb = new StringBuilder();
        sb.append("Please generate a detailed MA Support Ticket Draft.\n\n");

        if (project != null) {
            sb.append("**Project Context:**\n")
              .append("- Project Name: ").append(project.getProjectName() != null ? project.getProjectName() : "").append("\n")
              .append("- Project Code: ").append(project.getProjectCode() != null ? project.getProjectCode() : "").append("\n")
              .append("- Description: ").append(project.getDescription() != null ? project.getDescription() : "").append("\n\n");
        }

        if (ticketType != null && !ticketType.isBlank()) {
            sb.append("- Ticket Type: ").append(ticketType).append("\n");
        }
        if (severity != null && !severity.isBlank()) {
            sb.append("- Severity: ").append(severity).append("\n");
        }
        if (customTitle != null && !customTitle.isBlank()) {
            sb.append("- Draft Issue Title: ").append(customTitle).append("\n");
        }
        if (customPrompt != null && !customPrompt.isBlank()) {
            sb.append("- Issue Details / Prompt: ").append(customPrompt).append("\n");
        } else {
            sb.append("- Prompt: Generate full ticket issue description and resolution steps.\n");
        }

        return sb.toString();
    }

    private MaTicketDraft parseAiResponse(String aiResponse) {
        if (aiResponse == null || aiResponse.isBlank() || aiResponse.trim().equals("{}")) {
            return fallbackDraft("No response from AI");
        }

        String jsonContent = aiResponse.trim();
        Matcher matcher = JSON_PATTERN.matcher(jsonContent);
        if (matcher.find()) {
            jsonContent = matcher.group(1).trim();
        }

        try {
            MaTicketDraft draft = objectMapper.readValue(jsonContent, MaTicketDraft.class);
            if (draft == null || (draft.getTitle() == null && draft.getDescription() == null)) {
                return fallbackDraft(aiResponse);
            }
            return draft;
        } catch (Exception e) {
            log.warn("Failed to parse AI JSON response for MA Ticket, attempting raw extraction: {}", e.getMessage());
            return fallbackDraft(aiResponse);
        }
    }

    private MaTicketDraft fallbackDraft(String text) {
        return MaTicketDraft.builder()
                .title("แจ้งปัญหาการใช้งาน (AI Draft)")
                .ticketType(null)
                .severity(null)
                .description("<p>" + text.replace("\n", "<br/>") + "</p>")
                .resolutionSummary("<p>อยู่ระหว่างการตรวจสอบหาสาเหตุ</p>")
                .build();
    }
}
