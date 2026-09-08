package com.softinter.sicapi.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.request.GenerateUserManualDraftRequest;
import com.softinter.sicapi.dto.response.UserManualDraftResponse;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.entity.pm.PmSpecification;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationRepository;
import com.softinter.sicapi.service.PmAiProviderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserManualGeneratorService {

    private final PmAiProviderService aiProviderService;
    private final PmRequirementRepository requirementRepository;
    private final PmSpecificationRepository specificationRepository;
    private final ObjectMapper objectMapper;

    private static final Pattern JSON_PATTERN = Pattern.compile("```json\\s*([\\s\\S]*?)```");

    @Transactional(readOnly = true)
    public UserManualDraftResponse generateDraft(GenerateUserManualDraftRequest request) {
        List<PmRequirement> requirements = new ArrayList<>();
        if (request.getRequirementIds() != null && !request.getRequirementIds().isEmpty()) {
            requirements = requirementRepository.findAllById(request.getRequirementIds());
        }

        List<PmSpecification> specifications = new ArrayList<>();
        if (request.getSpecificationIds() != null && !request.getSpecificationIds().isEmpty()) {
            specifications = specificationRepository.findAllById(request.getSpecificationIds());
        }

        String manualType = request.getManualType() != null && !request.getManualType().isBlank()
                ? request.getManualType() : "USER";

        String prompt = buildPrompt(requirements, specifications, manualType, request.getManualTitle(), request.getPrompt());
        String systemPrompt = """
                You are a Principal Technical Writer, Lead System Analyst, and Enterprise Documentation Specialist with 15+ years of experience.
                Your task is to analyze system requirements, technical specifications, and user instructions to produce an outstanding, highly structured, comprehensive User Manual (คู่มือการใช้งานระบบ) in Thai JSON format.
                
                Ensure each section has rich, clear, and engaging HTML formatting (e.g. <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <table>, <blockquote>, and styled callout boxes for tips/warnings) compatible with rich-text Tiptap editors.
                Return ONLY valid JSON matching the requested schema.
                """;

        String aiResponse = aiProviderService.generateRawResponse(prompt, systemPrompt);
        UserManualDraftResponse draft = parseAiResponse(aiResponse, manualType, request.getManualTitle(), requirements, specifications);

        if (draft.getManualType() == null || draft.getManualType().isBlank()) {
            draft.setManualType(manualType);
        }

        return draft;
    }

    private String buildPrompt(List<PmRequirement> requirements, List<PmSpecification> specifications,
                               String manualType, String customTitle, String customPrompt) {
        StringBuilder sb = new StringBuilder();
        sb.append("Please generate a detailed, professional, and comprehensive User Manual (คู่มือการใช้งานระบบ).\n\n");

        sb.append("**Target Manual Type:** ").append(manualType).append("\n");
        sb.append("- Explanation of Type: ");
        switch (manualType) {
            case "ADMIN" -> sb.append("Admin Manual (คู่มือผู้ดูแลระบบ - เน้นการตั้งค่าสิทธิ์ผู้ใช้, Master Data, ตรวจสอบ Audit Log, การจัดการระบบ)\n\n");
            case "INSTALLATION" -> sb.append("Installation Manual (คู่มือติดตั้งระบบ - สภาพแวดล้อม Server, ฐานข้อมูล, ขั้นตอนการ Deploy และตรวจสอบความพร้อม)\n\n");
            case "OPERATION" -> sb.append("Operation Manual (คู่มือการปฏิบัติงาน - SOP ขั้นตอนประจำวัน, การสำรองข้อมูล, การบำรุงรักษา)\n\n");
            case "TROUBLESHOOT" -> sb.append("Troubleshooting Guide (คู่มือแก้ปัญหา - ปัญหาที่พบบ่อย, รหัสข้อผิดพลาด และวิธีแก้ไขทีละขั้นตอน)\n\n");
            default -> sb.append("User Manual (คู่มือการใช้งานทั่วไป - ภาพรวมระบบ, การเข้าสู่ระบบ, ขั้นตอนการใช้งานฟังก์ชันหลักทีละขั้นตอนพร้อมตัวอย่าง)\n\n");
        }

        if (customTitle != null && !customTitle.isBlank()) {
            sb.append("**Draft Manual Title:** ").append(customTitle).append("\n\n");
        }

        if (requirements != null && !requirements.isEmpty()) {
            sb.append("**Selected Requirements Data (ความต้องการของระบบ):**\n");
            for (PmRequirement req : requirements) {
                sb.append("--- Requirement: ").append(req.getRequirementCode() != null ? req.getRequirementCode() + " - " : "")
                  .append(req.getTitle()).append(" ---\n");
                if (req.getDescription() != null && !req.getDescription().isBlank()) {
                    sb.append("  - Description: ").append(req.getDescription()).append("\n");
                }
                if (req.getAcceptanceCriteria() != null && !req.getAcceptanceCriteria().isBlank()) {
                    sb.append("  - Acceptance Criteria: ").append(req.getAcceptanceCriteria()).append("\n");
                }
                sb.append("\n");
            }
        }

        if (specifications != null && !specifications.isEmpty()) {
            sb.append("**Selected Specifications Data (ข้อกำหนดทางเทคนิคและฟังก์ชัน):**\n");
            for (PmSpecification spec : specifications) {
                sb.append("--- Specification: ").append(spec.getSpecificationCode() != null ? spec.getSpecificationCode() + " - " : "")
                  .append(spec.getTitle()).append(" (Type: ").append(spec.getSpecificationType() != null ? spec.getSpecificationType() : "General").append(") ---\n");
                if (spec.getDescription() != null && !spec.getDescription().isBlank()) {
                    sb.append("  - Description: ").append(spec.getDescription()).append("\n");
                }
                sb.append("\n");
            }
        }

        if (customPrompt != null && !customPrompt.isBlank()) {
            sb.append("**User Specific Focus / Instructions:**\n")
              .append(customPrompt).append("\n\n");
        }

        sb.append("""
                **Output Requirements:**
                1. Return a valid JSON object ONLY. Do NOT wrap in conversational text.
                2. Write primarily in natural, professional Thai language with standard technical English in parentheses where appropriate.
                3. Structure the manual into 3 to 6 logical, comprehensive sections, for example:
                   - Section 1: บทนำและภาพรวมระบบ (System Overview & Objectives)
                   - Section 2: สิทธิ์และการเข้าสู่ระบบ (Access Control & Login)
                   - Section 3: ขั้นตอนการทำงานและฟังก์ชันหลัก (Step-by-Step Main Workflows & Instructions)
                   - Section 4: กฎและเงื่อนไขการทำงาน (Business Rules & Validations)
                   - Section 5: ข้อควรระวังและการแก้ปัญหาเบื้องต้น (Tips, FAQ & Troubleshooting)
                4. For each section, write detailed rich HTML in `content` with:
                   - Detailed explanatory paragraphs (`<p>`)
                   - Ordered lists for sequential steps (`<ol><li>...</li></ol>`)
                   - Bullet points for feature lists or notes (`<ul><li>...</li></ul>`)
                   - Styled callout blocks for tips and warnings:
                     `<div style="padding: 10px 14px; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 6px; margin: 12px 0;"><strong>💡 คำแนะนำ:</strong> ...</div>`
                     `<div style="padding: 10px 14px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px; margin: 12px 0;"><strong>⚠️ ข้อควรระวัง:</strong> ...</div>`

                **JSON Schema:**
                ```json
                {
                  "manualTitle": "ชื่อคู่มือการใช้งานที่ชัดเจนและสมบูรณ์",
                  "manualType": "USER",
                  "summary": "สรุปเนื้อหาภาพรวมของคู่มือฉบับนี้",
                  "sections": [
                    {
                      "sectionCode": "SEC-1",
                      "sectionTitle": "1. บทนำและภาพรวมระบบ (Overview & Objectives)",
                      "content": "<p>...</p>",
                      "sortOrder": 1
                    },
                    {
                      "sectionCode": "SEC-2",
                      "sectionTitle": "2. การเข้าใช้งานและสิทธิ์ผู้ใช้งาน (Access & Permissions)",
                      "content": "<p>...</p><ol><li>...</li></ol>",
                      "sortOrder": 2
                    }
                  ]
                }
                ```
                """);

        return sb.toString();
    }

    private UserManualDraftResponse parseAiResponse(String aiResponse, String manualType, String customTitle,
                                                   List<PmRequirement> reqs, List<PmSpecification> specs) {
        try {
            Matcher matcher = JSON_PATTERN.matcher(aiResponse);
            String json;
            if (matcher.find()) {
                json = matcher.group(1).trim();
            } else {
                json = aiResponse.trim();
            }
            return objectMapper.readValue(json, UserManualDraftResponse.class);
        } catch (Exception e) {
            log.error("Failed to parse AI response for User Manual: {}", aiResponse, e);
            return createFallbackResponse(manualType, customTitle, reqs, specs, aiResponse);
        }
    }

    private UserManualDraftResponse createFallbackResponse(String manualType, String customTitle,
                                                          List<PmRequirement> reqs, List<PmSpecification> specs,
                                                          String rawResponse) {
        UserManualDraftResponse fallback = new UserManualDraftResponse();
        String title = (customTitle != null && !customTitle.isBlank()) ? customTitle : "คู่มือการใช้งานระบบ (User Manual)";
        fallback.setManualTitle(title);
        fallback.setManualType(manualType);
        fallback.setSummary("คู่มือการใช้งานสร้างโดยระบบ AI Assistant");

        List<UserManualDraftResponse.SectionDraftDto> sections = new ArrayList<>();
        sections.add(new UserManualDraftResponse.SectionDraftDto(
                "SEC-1",
                "1. บทนำและวัตถุประสงค์ (Overview & Objectives)",
                "<p>คู่มือฉบับนี้จัดทำขึ้นเพื่อเป็นแนวทางการใช้งานระบบตามข้อกำหนดความต้องการ</p>" +
                "<div style=\"padding: 10px 14px; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 6px; margin: 12px 0;\"><strong>💡 คำแนะนำ:</strong> กรุณาอ่านทำความเข้าใจขั้นตอนก่อนเริ่มปฏิบัติงานจริง</div>",
                1
        ));

        sections.add(new UserManualDraftResponse.SectionDraftDto(
                "SEC-2",
                "2. การเข้าใช้งานระบบและสิทธิ์ผู้ใช้งาน (Access & Roles)",
                "<p>ขั้นตอนการเข้าสู่ระบบและการตรวจสอบสิทธิ์การเข้าถึงฟังก์ชันต่างๆ:</p>" +
                "<ol>" +
                "<li>เปิดเว็บบราวเซอร์และไปที่ URL ของระบบ</li>" +
                "<li>กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าสู่ระบบ</li>" +
                "<li>ระบบจะตรวจสอบสิทธิ์และนำเข้าสู่หน้าจอการทำงานหลัก</li>" +
                "</ol>",
                2
        ));

        sections.add(new UserManualDraftResponse.SectionDraftDto(
                "SEC-3",
                "3. ขั้นตอนการใช้งานฟังก์ชันหลัก (Core Workflows)",
                "<p>รายละเอียดขั้นตอนการทำงานฟังก์ชันหลักตามข้อกำหนด:</p>" +
                (rawResponse != null && !rawResponse.isBlank() ? "<div>" + rawResponse + "</div>" : "<p>กรอกข้อมูลและดำเนินการตามแบบฟอร์มในระบบ</p>"),
                3
        ));

        sections.add(new UserManualDraftResponse.SectionDraftDto(
                "SEC-4",
                "4. คำถามที่พบบ่อยและการแก้ปัญหา (FAQ & Troubleshooting)",
                "<p>รายการข้อควรระวังและวิธีตรวจสอบเมื่อพบปัญหา:</p>" +
                "<div style=\"padding: 10px 14px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px; margin: 12px 0;\"><strong>⚠️ ข้อควรระวัง:</strong> ตรวจสอบความถูกต้องของข้อมูลก่อนกดยืนยันบันทึก</div>",
                4
        ));

        fallback.setSections(sections);
        return fallback;
    }
}
