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
                Your task is to generate a comprehensive, detailed, professional Software Contract draft in JSON format.
                
                RULES:
                1. Respond strictly in valid JSON format.
                2. Do NOT wrap with any text outside the ```json ``` block.
                3. Fill EVERY field of the JSON (including dropdown/code/date/number fields) with a sensible value inferred from the user's prompt and project context. If the user explicitly provided a value, use it exactly. Never leave a field null unless it is truly impossible to infer. For dropdown fields choose ONE value from the allowed list given for that field. Dates use yyyy-MM-dd. contractType must be one of: Development Contract | Maintenance Contract | Support Contract | Change Request Contract | Extension Contract. signStatus must be one of: Draft | Sent | Signed | Expired (use Draft for a new contract). contractNo follows the pattern CT-YYYY-NNN. contractValue is a number.
                4. The JSON structure MUST be:
                {
                    "contractNo": "CT-2026-001",
                    "contractType": "Development Contract",
                    "contractValue": 1000000,
                    "paymentTerms": "รายละเอียดเงื่อนไขการแบ่งชำระเงินตามงวดงานอย่างชัดเจนและครบถ้วน (เช่น แบ่งชำระเป็น 3 งวด: งวดที่ 1 30% เมื่อลงนามสัญญา, งวดที่ 2 40% เมื่อส่งมอบระบบเวอร์ชันทดสอบ (UAT), งวดที่ 3 30% เมื่อตรวจรับมอบงานเสร็จสมบูรณ์)",
                    "scopeSummary": "<h3>1. วัตถุประสงค์และขอบเขตงาน</h3><p>...</p><h3>2. รายการส่งมอบและขั้นตอนการดำเนินงาน</h3><ul><li>...</li></ul><h3>3. การรับประกันและบริการหลังการขาย</h3><p>...</p><h3>4. ข้อกำหนดการรักษาความลับและทรัพย์สินทางปัญญา</h3><p>...</p>",
                    "startDate": "2026-01-01",
                    "endDate": "2026-12-31",
                    "signStatus": "Draft"
                }
                5. Ensure professional, legally sound wording in Thai. Provide rich and detailed HTML tags for scopeSummary.
                """;

        try {
            String rawResponse = aiProviderService.generateRawResponse(prompt, systemPrompt, request);
            return parseResponse(rawResponse, request, project);
        } catch (Exception e) {
            log.error("AI contract generation failed, falling back to heuristic: {}", e.getMessage());
            return buildFallback(request, project);
        }
    }

    private String buildPrompt(PmCustomerProject project, String contractNo, String contractType, BigDecimal contractValue, String userPrompt) {
        StringBuilder sb = new StringBuilder();
        sb.append("กรุณาร่างสัญญาจ้างพัฒนาซอฟต์แวร์หรือบริการ IT โดยมีรายละเอียดประกอบดังนี้:\n");
        if (project != null) {
            sb.append("- ชื่อโครงการ: ").append(project.getProjectName()).append("\n");
            sb.append("- รหัสโครงการ: ").append(project.getProjectCode()).append("\n");
            if (project.getDescription() != null && !project.getDescription().isBlank()) {
                sb.append("- รายละเอียดโครงการ: ").append(project.getDescription()).append("\n");
            }
        }
        if (contractNo != null && !contractNo.isBlank()) {
            sb.append("- เลขที่สัญญา: ").append(contractNo).append("\n");
        }
        if (contractType != null && !contractType.isBlank()) {
            sb.append("- ประเภทสัญญา: ").append(contractType).append("\n");
        }
        if (contractValue != null) {
            sb.append("- มูลค่าสัญญา: ").append(contractValue).append(" บาท\n");
        }
        if (userPrompt != null && !userPrompt.isBlank()) {
            sb.append("- ข้อกำหนดเพิ่มเติมจากผู้ใช้: ").append(userPrompt).append("\n");
        } else {
            sb.append("- ข้อกำหนดเพิ่มเติม: ให้ร่างเนื้อหาขอบเขตงานและงวดการชำระเงินมาตรฐานสำหรับการพัฒนาซอฟต์แวร์ระดับองค์กร\n");
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
            if (draft == null) {
                return buildFallback(request, project);
            }

            ContractDraft fallback = buildFallback(request, project);
            if (draft.getScopeSummary() == null || draft.getScopeSummary().trim().length() < 25) {
                draft.setScopeSummary(fallback.getScopeSummary());
            }
            if (draft.getPaymentTerms() == null || draft.getPaymentTerms().trim().length() < 10) {
                draft.setPaymentTerms(fallback.getPaymentTerms());
            }

            // ค่าที่ผู้ใช้ระบุมาเองมาก่อน ถ้าว่างใช้ค่าที่ AI เสนอ (frontend จะกรอกเฉพาะช่องที่ยังว่างอยู่)
            if (request.getContractNo() != null && !request.getContractNo().isBlank()) draft.setContractNo(request.getContractNo());
            if (request.getContractType() != null && !request.getContractType().isBlank()) draft.setContractType(request.getContractType());
            if (request.getContractValue() != null) draft.setContractValue(request.getContractValue());
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
