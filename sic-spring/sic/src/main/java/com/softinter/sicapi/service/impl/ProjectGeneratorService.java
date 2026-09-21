package com.softinter.sicapi.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.request.GenerateProjectDraftRequest;
import com.softinter.sicapi.dto.response.ProjectDraft;
import com.softinter.sicapi.entity.pm.PmCustomer;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.service.PmAiProviderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectGeneratorService {

    private final PmAiProviderService aiProviderService;
    private final PmCustomerRepository customerRepository;
    private final ObjectMapper objectMapper;

    private static final Pattern JSON_PATTERN = Pattern.compile("```json\\s*([\\s\\S]*?)```");

    public ProjectDraft generateDraft(GenerateProjectDraftRequest request) {
        PmCustomer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId()).orElse(null);
        }

        String prompt = buildPrompt(customer, request.getProjectCode(), request.getProjectName(), request.getPrompt());
        String systemPrompt = """
                You are a Senior Project Manager and Solutions Architect with 15+ years of experience leading enterprise software development projects.
                Your task is to generate a comprehensive, structured Project Charter / Plan draft in JSON format.
                
                RULES:
                1. Respond strictly in valid JSON format.
                2. Do NOT wrap with any text outside the ```json ``` block.
                3. Leave projectCode, startDate, endDate, and status as null unless specifically provided by the user. Do NOT invent project codes, dates, or status values - users will specify these themselves.
                4. The JSON structure MUST be:
                {
                    "projectCode": null,
                    "projectName": "Clear and professional project title (e.g. โครงการพัฒนาระบบบริหารจัดการลูกค้าสัมพันธ์อัจฉริยะ)",
                    "description": "Comprehensive project description, business objectives, scope, and key deliverables formatted in HTML using <p>, <ul>, <li>, <strong>, <h3> tags",
                    "startDate": null,
                    "endDate": null,
                    "status": null
                }
                5. Ensure professional phrasing. If prompt in Thai, respond in Thai.
                """;

        try {
            String rawResponse = aiProviderService.generateRawResponse(prompt, systemPrompt, request.getModel(), request.getAttachments());
            return parseResponse(rawResponse, request, customer);
        } catch (Exception e) {
            log.error("AI project generation failed, falling back to heuristic: {}", e.getMessage());
            return buildFallback(request, customer);
        }
    }

    private String buildPrompt(PmCustomer customer, String projectCode, String projectName, String userPrompt) {
        StringBuilder sb = new StringBuilder();
        sb.append("Please draft a comprehensive enterprise software project with the following context:\n");
        if (customer != null) {
            String cName = customer.getCompanyNameLocal() != null ? customer.getCompanyNameLocal() : customer.getCompanyNameEn();
            sb.append("- Customer / Client: ").append(cName).append("\n");
        }
        if (projectCode != null && !projectCode.isBlank()) {
            sb.append("- Project Code: ").append(projectCode).append("\n");
        }
        if (projectName != null && !projectName.isBlank()) {
            sb.append("- Project Name: ").append(projectName).append("\n");
        }
        if (userPrompt != null && !userPrompt.isBlank()) {
            sb.append("- Instructions / Requirements: ").append(userPrompt).append("\n");
        }
        return sb.toString();
    }

    private ProjectDraft parseResponse(String rawResponse, GenerateProjectDraftRequest request, PmCustomer customer) {
        if (rawResponse == null || rawResponse.isBlank() || rawResponse.trim().equals("{}")) {
            return buildFallback(request, customer);
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
            ProjectDraft draft = objectMapper.readValue(jsonStr, ProjectDraft.class);
            if (draft == null || (draft.getProjectName() == null && draft.getDescription() == null)) {
                return buildFallback(request, customer);
            }
            draft.setProjectCode(request.getProjectCode() != null && !request.getProjectCode().isBlank() ? request.getProjectCode() : null);
            draft.setStartDate(null);
            draft.setEndDate(null);
            draft.setStatus(null);
            return draft;
        } catch (Exception e) {
            log.warn("Failed to parse JSON response for project draft, using fallback. Raw response: {}", rawResponse);
            return buildFallback(request, customer);
        }
    }

    private ProjectDraft buildFallback(GenerateProjectDraftRequest request, PmCustomer customer) {
        String custName = customer != null ? (customer.getCompanyNameLocal() != null ? customer.getCompanyNameLocal() : customer.getCompanyNameEn()) : "ลูกค้าองค์กร";

        String pName = (request.getProjectName() != null && !request.getProjectName().isBlank())
                ? request.getProjectName()
                : "โครงการพัฒนาระบบสารสนเทศสำหรับ " + custName;

        return ProjectDraft.builder()
                .projectCode(request.getProjectCode() != null && !request.getProjectCode().isBlank() ? request.getProjectCode() : null)
                .projectName(pName)
                .description("<p><strong>วัตถุประสงค์ของโครงการ:</strong></p>" +
                        "<p>เพื่อพัฒนาและติดตั้งระบบสารสนเทศที่ตอบสนองต่อกระบวนการทำงานของ " + custName + " เพิ่มประสิทธิภาพในการดำเนินงานและลดข้อผิดพลาด</p>" +
                        "<p><strong>ขอบเขตงานหลัก:</strong></p>" +
                        "<ul>" +
                        "<li>วิเคราะห์ ออกแบบ และพัฒนาระบบตาม Requirement</li>" +
                        "<li>การเชื่อมต่อฐานข้อมูลและ API กับระบบเดิม</li>" +
                        "<li>การทดสอบระบบ (Unit Test, SIT, UAT) และการแก้ไขข้อผิดพลาด</li>" +
                        "<li>การติดตั้งบน Server และส่งมอบคู่มือการใช้งาน</li>" +
                        "</ul>")
                .startDate(null)
                .endDate(null)
                .status(null)
                .build();
    }
}
