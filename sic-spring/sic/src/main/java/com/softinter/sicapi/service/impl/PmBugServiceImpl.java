package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmBugRequest;
import com.softinter.sicapi.dto.response.PmBugResponse;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.enums.TraceRelationship;
import com.softinter.sicapi.entity.pm.PmBug;
import com.softinter.sicapi.entity.pm.PmTask;
import com.softinter.sicapi.entity.pm.PmTestCase;
import com.softinter.sicapi.repository.pm.PmBugRepository;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.pm.PmTestCaseRepository;
import com.softinter.sicapi.service.PmBugService;
import com.softinter.sicapi.service.AuditLogService;
import com.softinter.sicapi.service.TraceLinkService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmBugServiceImpl implements PmBugService {

    private final PmBugRepository bugRepository;
    private final PmTaskRepository taskRepository;
    private final PmTestCaseRepository testCaseRepository;
    private final AuditLogService auditLogService;
    private final TraceLinkService traceLinkService;
    private final com.softinter.sicapi.service.PmAiProviderService aiProviderService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    private static final java.util.regex.Pattern JSON_BLOCK_PATTERN = java.util.regex.Pattern.compile("```(?:json)?\\s*([\\s\\S]*?)```", java.util.regex.Pattern.MULTILINE);

    @Override
    @Transactional(readOnly = true)
    public Page<PmBugResponse> findAll(UUID businessId, UUID projectId, String keyword, Pageable pageable) {
        Specification<PmBug> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("businessId"), businessId));
            predicates.add(cb.isFalse(root.get("isDelete")));

            if (projectId != null) {
                predicates.add(cb.equal(root.get("projectId"), projectId));
            }

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("bugCode")), pattern),
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern),
                        cb.like(cb.lower(root.get("assignedTo")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return bugRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PmBugResponse findById(UUID id, UUID businessId) {
        PmBug bug = bugRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบ Bug/Issue"));
        return toResponse(bug);
    }

    @Override
    @Transactional
    public UUID save(PmBugRequest request, UUID businessId, String userId) {
        EntityState state = request.getState() != null ? EntityState.values()[request.getState()] : EntityState.DETACHED;
        PmBug entity;
        boolean isNew = (request.getId() == null);

        if (state == EntityState.DELETED) {
            delete(request.getId(), businessId, userId);
            return request.getId();
        } else if (isNew) {
            entity = new PmBug();
            entity.setBusinessId(businessId);
            entity.setCreatedBy(userId);
            entity.setCreatedDate(Instant.now());
            mapRequestToEntity(request, entity);
            entity = bugRepository.save(entity);
        } else {
            entity = bugRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบ Bug/Issue"));
            if (request.getRowVersion() != null && !request.getRowVersion().equals(entity.getRowVersion())) {
                throw new RuntimeException("ข้อมูลถูกแก้ไขโดยผู้อื่น กรุณารีเฟรชข้อมูล");
            }
            mapRequestToEntity(request, entity);
            entity.setUpdatedBy(userId);
            entity.setUpdatedDate(Instant.now());
            entity = bugRepository.save(entity);
        }

        createBugTraceLinks(entity);

        // Audit Log
        try {
            String action = isNew ? "CREATE_BUG" : "UPDATE_BUG";
            auditLogService.log(action, "Bug Management",
                    action.replace("_", " ") + ": " + entity.getTitle() + " (" + entity.getBugCode() + ")",
                    "BUG", entity.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log bug: {}", e.getMessage(), e);
        }

        return entity.getId();
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID businessId, String userId) {
        PmBug bug = bugRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบ Bug/Issue"));
        bug.setIsDelete(true);
        bug.setDeleteBy(userId);
        bug.setDeleteDate(Instant.now());
        bugRepository.save(bug);

        try {
            auditLogService.log("DELETE_BUG", "Bug Management",
                    "ลบ Bug: " + bug.getTitle() + " (" + bug.getBugCode() + ")",
                    "BUG", bug.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log DELETE_BUG: {}", e.getMessage(), e);
        }
    }

    private void createBugTraceLinks(PmBug entity) {
        if (entity.getProjectId() == null) {
            return;
        }
        try {
            if (entity.getTestCaseId() != null) {
                traceLinkService.createLink(entity.getProjectId(),
                        "TEST_CASE", entity.getTestCaseId(),
                        "BUG", entity.getId(),
                        TraceRelationship.FAILED_BY);
            }
            if (entity.getTaskId() != null) {
                traceLinkService.createLink(entity.getProjectId(),
                        "TASK", entity.getTaskId(),
                        "BUG", entity.getId(),
                        TraceRelationship.RELATED_TO);
            }
        } catch (Exception e) {
            log.warn("Failed to create trace link for bug: {}", e.getMessage());
        }
    }

    private void mapRequestToEntity(PmBugRequest req, PmBug entity) {
        // ✅ derive taskId/projectId จาก Test Case เสมอถ้ามี testCaseId
        // ห้าม trust req.getProjectId()/req.getTaskId() แยกต่างหาก (กันกรณีไม่ตรงกับ test case จริง)
        if (req.getTestCaseId() != null) {
            PmTestCase tc = testCaseRepository.findById(req.getTestCaseId())
                    .orElseThrow(() -> new RuntimeException("ไม่พบ Test Case"));
            entity.setTaskId(tc.getTaskId());
            entity.setProjectId(tc.getProjectId());
        } else {
            entity.setTaskId(req.getTaskId());
            if (req.getProjectId() != null) {
                entity.setProjectId(req.getProjectId());
            } else if (req.getTaskId() != null) {
                taskRepository.findById(req.getTaskId()).ifPresent(task -> {
                    if (task.getWorkPackage() != null && task.getWorkPackage().getMilestone() != null
                            && task.getWorkPackage().getMilestone().getPhase() != null
                            && task.getWorkPackage().getMilestone().getPhase().getProject() != null) {
                        entity.setProjectId(task.getWorkPackage().getMilestone().getPhase().getProject().getId());
                    }
                });
            }
        }
        entity.setTestCaseId(req.getTestCaseId());
        entity.setBugCode(req.getBugCode());
        entity.setTitle(req.getTitle());
        entity.setDescription(req.getDescription());
        entity.setStepsToReproduce(req.getStepsToReproduce());
        entity.setEnvironment(req.getEnvironment());
        entity.setIssueType(req.getIssueType() != null ? req.getIssueType() : "Bug");
        entity.setAttachmentGroupId(req.getAttachmentGroupId());
        entity.setSeverity(req.getSeverity() != null ? req.getSeverity() : "Medium");
        entity.setPriority(req.getPriority() != null ? req.getPriority() : "Medium");
        entity.setFoundBy(req.getFoundBy());
        entity.setAssignedTo(req.getAssignedTo());
        entity.setFoundDate(req.getFoundDate());
        entity.setFixDueDate(req.getFixDueDate());
        entity.setFixedDate(req.getFixedDate());
        entity.setStatus(req.getStatus() != null ? req.getStatus() : "Open");
        entity.setRelatedSpec(req.getRelatedSpec());
    }

    private PmBugResponse toResponse(PmBug entity) {
        PmBugResponse res = new PmBugResponse();
        res.setId(entity.getId());
        res.setProjectId(entity.getProjectId());
        res.setBugCode(entity.getBugCode());
        res.setTitle(entity.getTitle());
        res.setDescription(entity.getDescription());
        res.setStepsToReproduce(entity.getStepsToReproduce());
        res.setEnvironment(entity.getEnvironment());
        res.setIssueType(entity.getIssueType());
        res.setAttachmentGroupId(entity.getAttachmentGroupId());
        res.setSeverity(entity.getSeverity());
        res.setPriority(entity.getPriority());
        res.setFoundBy(entity.getFoundBy());
        res.setAssignedTo(entity.getAssignedTo());
        res.setFoundDate(entity.getFoundDate());
        res.setFixDueDate(entity.getFixDueDate());
        res.setFixedDate(entity.getFixedDate());
        res.setStatus(entity.getStatus());
        res.setRelatedSpec(entity.getRelatedSpec());
        res.setTaskId(entity.getTaskId());
        if (entity.getTaskId() != null) {
            taskRepository.findById(entity.getTaskId()).ifPresent(task -> {
                res.setTaskCode(task.getTaskCode());
                res.setTaskName(task.getTaskName());
            });
        }
        res.setTestCaseId(entity.getTestCaseId());
        if (entity.getTestCaseId() != null) {
            testCaseRepository.findById(entity.getTestCaseId()).ifPresent(tc -> {
                res.setTestCaseCode(tc.getTestCaseCode());
            });
        }
        res.setCreatedDate(entity.getCreatedDate());
        res.setUpdatedDate(entity.getUpdatedDate());
        res.setRowVersion(entity.getRowVersion());
        return res;
    }

    @Override
    @Transactional(readOnly = true)
    public com.softinter.sicapi.dto.response.AiBugResolutionResponse analyzeBugResolution(
            com.softinter.sicapi.dto.request.AiBugResolutionRequest request, UUID businessId) {

        String lang = (request.getLang() != null && request.getLang().equalsIgnoreCase("en")) ? "en" : "th";
        String title = request.getTitle();
        String description = request.getDescription();
        String stepsToReproduce = request.getStepsToReproduce();
        String environment = request.getEnvironment();

        // If bugId is supplied, fill missing fields from DB
        if (request.getBugId() != null && businessId != null) {
            PmBug existing = bugRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getBugId(), businessId).orElse(null);
            if (existing != null) {
                if (title == null || title.isBlank()) title = existing.getTitle();
                if (description == null || description.isBlank()) description = existing.getDescription();
                if (stepsToReproduce == null || stepsToReproduce.isBlank()) stepsToReproduce = existing.getStepsToReproduce();
                if (environment == null || environment.isBlank()) environment = existing.getEnvironment();
            }
        }

        if ((title == null || title.isBlank()) && (description == null || description.isBlank())) {
            return com.softinter.sicapi.dto.response.AiBugResolutionResponse.builder()
                    .rootCause(lang.equals("en") ? "Insufficient bug details provided." : "ข้อมูลข้อผิดพลาดไม่เพียงพอในการวิเคราะห์")
                    .suggestedFix(lang.equals("en") ? "Please provide a title and steps to reproduce." : "กรุณาระบุหัวข้อข้อผิดพลาดและขั้นตอนการทำให้เกิดปัญหา")
                    .recommendedSeverity("LOW")
                    .confidenceScore(0)
                    .lang(lang)
                    .build();
        }

        String systemPrompt = lang.equals("en")
                ? "You are a Principal Software Engineer and Debugging Specialist. Analyze the reported bug, determine the most likely root cause, propose an actionable technical fix with code/configuration examples, and provide regression verification steps. Output strictly valid JSON."
                : "คุณคือ Principal Software Engineer และผู้เชี่ยวชาญด้านการ Debug ระบบ วิเคราะห์สาเหตุที่แท้จริงของ Bug (Root Cause), เสนอแนวทางแก้ไขโค้ด/คอนฟิกพร้อมตัวอย่าง, และแนวทางเขียน Test ป้องกันไม่ให้เกิดซ้ำ ตอบกลับเป็น JSON ที่ถูกต้องเท่านั้น";

        String prompt = String.format("""
            %s

            === BUG REPORT INFORMATION ===
            - **Title / Summary**: %s
            - **Environment**: %s
            - **Steps to Reproduce & Expected vs Actual**:
            %s
            - **Additional Description / Stacktrace**:
            %s

            === TASK REQUIREMENTS ===
            Provide an in-depth analysis in **%s**:
            1. **rootCause**: Clear technical explanation of why this bug occurred (e.g. race condition, unhandled null, type coercion, missing state update).
            2. **suggestedFix**: Clear, numbered step-by-step developer guide on how to fix this issue.
            3. **preventionTest**: Specific unit/integration/E2E test case recommendation to prevent future regressions.
            4. **recommendedSeverity**: "LOW", "MEDIUM", "HIGH", or "CRITICAL".
            5. **confidenceScore**: Integer between 0 and 100 representing confidence in this diagnosis.
            6. **codeSnippet**: Clean code snippet or diff illustrating the fix.

            === STRICT JSON OUTPUT FORMAT ===
            ```json
            {
              "rootCause": "...",
              "suggestedFix": "1. ...\\n2. ...",
              "preventionTest": "...",
              "recommendedSeverity": "HIGH",
              "confidenceScore": 90,
              "codeSnippet": "// Fix snippet here"
            }
            ```
            Output ONLY the JSON block inside ```json ... ```.
            """,
            lang.equals("en") ? "Please analyze this bug report and provide a smart resolution." : "กรุณาวิเคราะห์สาเหตุของ Bug นี้และเสนอแนวทางแก้ไขเบื้องต้น",
            title != null ? title : "N/A",
            environment != null ? environment : "N/A",
            stepsToReproduce != null ? stepsToReproduce : "N/A",
            description != null ? description : "N/A",
            lang.equals("en") ? "ENGLISH" : "THAI (ภาษาไทย)"
        );

        String aiRawResponse = aiProviderService.generateRawResponse(prompt, systemPrompt, request.getModel());
        String extractedJson = extractJson(aiRawResponse);

        if (extractedJson != null && !extractedJson.isBlank()) {
            try {
                com.softinter.sicapi.dto.response.AiBugResolutionResponse response =
                        objectMapper.readValue(extractedJson, com.softinter.sicapi.dto.response.AiBugResolutionResponse.class);
                response.setLang(lang);
                return response;
            } catch (Exception e) {
                log.error("Failed to parse AI Bug resolution JSON: {}", e.getMessage());
            }
        }

        return com.softinter.sicapi.dto.response.AiBugResolutionResponse.builder()
                .rootCause(lang.equals("en") ? "Analyzed reported behavior: Potential logic or state mismatch." : "วิเคราะห์เบื้องต้น: อาจเกิดจากความผิดพลาดของ Logic หรือ State ข้อมูล")
                .suggestedFix(aiRawResponse != null ? aiRawResponse : (lang.equals("en") ? "Review component logic and validate input constraints." : "ตรวจสอบ Logic และเงื่อนไขการส่งข้อมูล"))
                .preventionTest(lang.equals("en") ? "Add unit test asserting edge case input." : "เพิ่ม Unit Test ทดสอบ Edge Cases")
                .recommendedSeverity("MEDIUM")
                .confidenceScore(60)
                .lang(lang)
                .build();
    }

    private String extractJson(String response) {
        if (response == null) return null;
        java.util.regex.Matcher matcher = JSON_BLOCK_PATTERN.matcher(response);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        int start = response.indexOf('{');
        int end = response.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return response.substring(start, end + 1).trim();
        }
        return null;
    }
}