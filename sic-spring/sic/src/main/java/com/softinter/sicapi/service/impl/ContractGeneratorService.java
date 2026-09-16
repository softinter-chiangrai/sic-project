package com.softinter.sicapi.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.request.GenerateContractDraftRequest;
import com.softinter.sicapi.dto.response.ContractDraft;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.service.PmAiProviderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContractGeneratorService {

    private final PmAiProviderService aiProviderService;
    private final PmCustomerProjectRepository projectRepository;
    private final ObjectMapper objectMapper;

    private static final Pattern JSON_PATTERN = Pattern.compile("```json\\s*([\\s\\S]*?)```");

    public ContractDraft generateDraft(GenerateContractDraftRequest request) {
        PmCustomerProject project = null;
        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId()).orElse(null);
        }

        String prompt = buildPrompt(project, request.getContractNo(), request.getContractType(), request.getContractValue(), request.getPrompt());
        String systemPrompt = """
                You are a Senior Legal Counsel and Enterprise Software Contract Specialist with 15+ years of experience drafting IT and Software Development contracts in Thailand.
                Your task is to generate a comprehensive, professional Software Contract draft in JSON format.
                
                RULES:
                1. Respond strictly in valid JSON format.
                2. Do NOT wrap with any text outside the ```json ``` block.
                3. Leave contractNo, contractType, contractValue, startDate, endDate, and signStatus as null unless specifically provided by the user. Do NOT invent dates, contract numbers, status, or types - users will specify these themselves.
                4. The JSON structure MUST be:
                {
                    "contractNo": null,
                    "contractType": null,
                    "contractValue": null,
                    "paymentTerms": "Clear payment milestone schedule (e.g. งวดที่ 1 30% เมื่อลงนาม, งวดที่ 2 40% เมื่อส่งมอบระบบ, งวดที่ 3 30% หลัง UAT ผ่าน)",
                    "scopeSummary": "Comprehensive scope of work formatted in HTML using <p>, <ul>, <li>, <strong>, <h3> tags explaining project background, deliverables, SLA terms, and confidentiality",
                    "startDate": null,
                    "endDate": null,
                    "signStatus": null
                }
                5. Ensure professional, legally sound wording. If prompt in Thai, respond in Thai.
                """;

        try {
            String rawResponse = aiProviderService.generateRawResponse(prompt, systemPrompt, request.getModel());
            return parseResponse(rawResponse, request, project);
        } catch (Exception e) {
            log.error("AI contract generation failed, falling back to heuristic: {}", e.getMessage());
            return buildFallback(request, project);
        }
    }

    private String buildPrompt(PmCustomerProject project, String contractNo, String contractType, BigDecimal contractValue, String userPrompt) {
        StringBuilder sb = new StringBuilder();
        sb.append("Please draft a professional software contract with the following context:\n");
        if (project != null) {
            sb.append("- Project Name: ").append(project.getProjectName()).append("\n");
            sb.append("- Project Code: ").append(project.getProjectCode()).append("\n");
        }
        if (contractNo != null && !contractNo.isBlank()) {
            sb.append("- Contract Number: ").append(contractNo).append("\n");
        }
        if (contractType != null && !contractType.isBlank()) {
            sb.append("- Contract Type: ").append(contractType).append("\n");
        }
        if (contractValue != null) {
            sb.append("- Contract Value: ").append(contractValue).append(" THB\n");
        }
        if (userPrompt != null && !userPrompt.isBlank()) {
            sb.append("- User Instructions / Special Terms: ").append(userPrompt).append("\n");
        }
        return sb.toString();
    }

    private ContractDraft parseResponse(String rawResponse, GenerateContractDraftRequest request, PmCustomerProject project) {
        if (rawResponse == null || rawResponse.isBlank() || rawResponse.trim().equals("{}")) {
            return buildFallback(request, project);
        }

        String jsonStr = rawResponse;
        Matcher matcher = JSON_PATTERN.matcher(rawResponse);
        if (matcher.find()) {
            jsonStr = matcher.group(1).trim();
        } else {
            int start = rawResponse.indexOf('{');
            int end = rawResponse.lastIndexOf('}');
            if (start >= 0 && end > start) {
                jsonStr = rawResponse.substring(start, end + 1).trim();
            }
        }

        try {
            ContractDraft draft = objectMapper.readValue(jsonStr, ContractDraft.class);
            if (draft == null || (draft.getScopeSummary() == null && draft.getPaymentTerms() == null)) {
                return buildFallback(request, project);
            }
            draft.setContractNo(request.getContractNo() != null && !request.getContractNo().isBlank() ? request.getContractNo() : null);
            draft.setContractType(request.getContractType() != null && !request.getContractType().isBlank() ? request.getContractType() : null);
            draft.setContractValue(request.getContractValue());
            draft.setStartDate(null);
            draft.setEndDate(null);
            draft.setSignStatus(null);
            return draft;
        } catch (Exception e) {
            log.warn("Failed to parse JSON response for contract draft, using fallback. Raw response: {}", rawResponse);
            return buildFallback(request, project);
        }
    }

    private ContractDraft buildFallback(GenerateContractDraftRequest request, PmCustomerProject project) {
        String projName = project != null ? project.getProjectName() : "ระบบสารสนเทศ";

        return ContractDraft.builder()
                .contractNo(request.getContractNo() != null && !request.getContractNo().isBlank() ? request.getContractNo() : null)
                .contractType(request.getContractType() != null && !request.getContractType().isBlank() ? request.getContractType() : null)
                .contractValue(request.getContractValue())
                .paymentTerms("แบ่งชำระเป็น 3 งวด: งวดที่ 1 (30%) เมื่อลงนามสัญญา, งวดที่ 2 (40%) เมื่อส่งมอบระบบเวอร์ชันทดสอบ, งวดที่ 3 (30%) เมื่อตรวจรับมอบงานเรียบร้อย (UAT Pass)")
                .scopeSummary("<p><strong>ขอบเขตของสัญญาจ้างพัฒนา:</strong> " + projName + "</p>" +
                        "<ul>" +
                        "<li>การออกแบบ พัฒนา และทดสอบระบบตามความต้องการที่ระบุในเอกสาร Specification</li>" +
                        "<li>การติดตั้งระบบบนสภาพแวดล้อมเซิร์ฟเวอร์ที่กำหนด</li>" +
                        "<li>การจัดทำคู่มือการใช้งานและอบรมบุคลากร</li>" +
                        "<li>การรับประกันและบำรุงรักษาระบบ (Warranty & Support) เป็นเวลา 1 ปีหลังจากส่งมอบงาน</li>" +
                        "</ul>")
                .startDate(null)
                .endDate(null)
                .signStatus(null)
                .build();
    }
}
