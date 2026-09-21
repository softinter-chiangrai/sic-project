package com.softinter.sicapi.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.request.GenerateInvoiceDraftRequest;
import com.softinter.sicapi.dto.response.InvoiceDraft;
import com.softinter.sicapi.entity.pm.PmCustomerContract;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.service.PmAiProviderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceGeneratorService {

    private final PmAiProviderService aiProviderService;
    private final PmCustomerProjectRepository projectRepository;
    private final PmCustomerContractRepository contractRepository;
    private final ObjectMapper objectMapper;

    private static final Pattern JSON_PATTERN = Pattern.compile("```json\\s*([\\s\\S]*?)```");

    public InvoiceDraft generateDraft(GenerateInvoiceDraftRequest request) {
        PmCustomerProject project = null;
        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId()).orElse(null);
        }

        PmCustomerContract contract = null;
        if (request.getContractId() != null) {
            contract = contractRepository.findById(request.getContractId()).orElse(null);
        }

        String prompt = buildPrompt(project, contract, request.getInvoiceType(), request.getInvoiceTitle(), request.getBillingPeriod(), request.getPrompt());
        String systemPrompt = """
                You are a Senior Project Financial Controller and Billing Specialist with 15+ years of experience in enterprise software contracting and invoicing.
                Your task is to generate a comprehensive, professional Software Invoice / Payment Milestone draft in JSON format.
                
                RULES:
                1. Respond strictly in valid JSON format.
                2. Do NOT wrap with any text outside the ```json ``` block.
                3. Leave billingType and vatRate as null. Do NOT invent billing types or VAT rates - users will specify these themselves.
                4. The JSON structure MUST be:
                {
                    "invoiceTitle": "Clear invoice / billing milestone title (e.g. งวดที่ 1: ส่งมอบ Requirement & System Architecture)",
                    "billingType": null,
                    "remark": "Terms, payment conditions, bank details, or notes formatted in HTML (<p>, <ul>, <li>, <strong>)",
                    "vatRate": null,
                    "items": [
                        {
                            "itemDescription": "Description of work/deliverable (e.g. ค่าพัฒนาและออกแบบระบบ Phase 1)",
                            "quantity": 1,
                            "unitPrice": 100000.0,
                            "amount": 100000.0
                        }
                    ]
                }
                5. Ensure professional tone. If prompt in Thai, respond in Thai.
                """;

        String aiResponse = aiProviderService.generateRawResponse(prompt, systemPrompt, request);
        InvoiceDraft draft = parseAiResponse(aiResponse);

        draft.setBillingType(null);
        draft.setVatRate(null);
        if (draft.getItems() == null) {
            draft.setItems(new ArrayList<>());
        }

        return draft;
    }

    private String buildPrompt(PmCustomerProject project, PmCustomerContract contract, String invoiceType, String customTitle, String billingPeriod, String customPrompt) {
        StringBuilder sb = new StringBuilder();
        sb.append("Please generate a professional Software Invoice / Milestone Draft.\n\n");

        if (project != null) {
            sb.append("**Project Context:**\n")
              .append("- Project Name: ").append(project.getProjectName() != null ? project.getProjectName() : "").append("\n")
              .append("- Project Code: ").append(project.getProjectCode() != null ? project.getProjectCode() : "").append("\n")
              .append("- Description: ").append(project.getDescription() != null ? project.getDescription() : "").append("\n\n");
        }

        if (contract != null) {
            sb.append("**Contract Context:**\n")
              .append("- Contract No: ").append(contract.getContractNo() != null ? contract.getContractNo() : "").append("\n")
              .append("- Contract Type: ").append(contract.getContractType() != null ? contract.getContractType() : "").append("\n")
              .append("- Scope Summary: ").append(contract.getScopeSummary() != null ? contract.getScopeSummary() : "").append("\n\n");
        }

        if (invoiceType != null && !invoiceType.isBlank()) {
            sb.append("- Billing Type selected by user: ").append(invoiceType).append(" (for context only, do not put this in the JSON - billingType must stay null)\n");
        }

        if (customTitle != null && !customTitle.isBlank()) {
            sb.append("- Draft Invoice Title / Milestone: ").append(customTitle).append("\n");
        }
        if (billingPeriod != null && !billingPeriod.isBlank()) {
            sb.append("- Billing Period: ").append(billingPeriod).append("\n");
        }
        if (customPrompt != null && !customPrompt.isBlank()) {
            sb.append("- Specific Requirements: ").append(customPrompt).append("\n");
        } else {
            sb.append("- Prompt: Generate invoice breakdown items, payment conditions, and remarks.\n");
        }

        return sb.toString();
    }

    private InvoiceDraft parseAiResponse(String aiResponse) {
        if (aiResponse == null || aiResponse.isBlank() || aiResponse.trim().equals("{}")) {
            return fallbackDraft("No response from AI");
        }

        String jsonContent = aiResponse.trim();
        Matcher matcher = JSON_PATTERN.matcher(jsonContent);
        if (matcher.find()) {
            jsonContent = matcher.group(1).trim();
        }

        try {
            InvoiceDraft draft = objectMapper.readValue(jsonContent, InvoiceDraft.class);
            if (draft == null || (draft.getInvoiceTitle() == null && draft.getRemark() == null)) {
                return fallbackDraft(aiResponse);
            }
            return draft;
        } catch (Exception e) {
            log.warn("Failed to parse AI JSON response for Invoice, attempting raw extraction: {}", e.getMessage());
            return fallbackDraft(aiResponse);
        }
    }

    private InvoiceDraft fallbackDraft(String text) {
        return InvoiceDraft.builder()
                .invoiceTitle("ใบแจ้งหนี้งวดงาน (AI Draft)")
                .billingType(null)
                .vatRate(null)
                .remark("<p>" + text.replace("\n", "<br/>") + "</p>")
                .items(new ArrayList<>())
                .build();
    }
}
