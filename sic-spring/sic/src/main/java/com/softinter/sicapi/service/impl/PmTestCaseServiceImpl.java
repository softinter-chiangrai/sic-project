package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmTestCaseRequest;
import com.softinter.sicapi.dto.response.PmTestCaseResponse;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.pm.PmTestCase;

import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.pm.PmTestCaseRepository;
import com.softinter.sicapi.repository.pm.PmTestScenarioRepository;
import com.softinter.sicapi.service.DocumentVersionService;
import com.softinter.sicapi.service.PmTestCaseService;
import com.softinter.sicapi.service.AuditLogService;
import com.softinter.sicapi.util.DocumentDiffHelper;
import com.softinter.sicapi.util.JsonSnapshotHelper;
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
public class PmTestCaseServiceImpl implements PmTestCaseService {

    private final PmTestCaseRepository testCaseRepository;
    private final PmTestScenarioRepository scenarioRepository;
    private final PmTaskRepository taskRepository;
    private final DocumentVersionService documentVersionService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public Page<PmTestCaseResponse> findAll(UUID businessId, UUID projectId, String keyword, Pageable pageable) {
        return findAll(businessId, projectId, null, null, keyword, pageable);
    }

    @Transactional(readOnly = true)
    public Page<PmTestCaseResponse> findAll(UUID businessId, UUID projectId, UUID scenarioId, String status, String keyword, Pageable pageable) {
        Specification<PmTestCase> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("businessId"), businessId));
            predicates.add(cb.equal(root.get("isDelete"), false));

            if (projectId != null) {
                predicates.add(cb.equal(root.get("projectId"), projectId));
            }
            if (scenarioId != null) {
                predicates.add(cb.equal(root.get("scenarioId"), scenarioId));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                Predicate codePred = cb.like(cb.lower(root.get("testCaseCode")), pattern);
                Predicate titlePred = cb.like(cb.lower(root.get("title")), pattern);
                predicates.add(cb.or(codePred, titlePred));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return testCaseRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PmTestCaseResponse findById(UUID id, UUID businessId) {
        PmTestCase testCase = testCaseRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบ Test Case"));
        return toResponse(testCase);
    }

    @Override
    @Transactional
    public UUID save(PmTestCaseRequest request, UUID businessId, String userId) {
        EntityState state = request.getState() != null ? EntityState.values()[request.getState()] : EntityState.DETACHED;
        PmTestCase entity;
        String diffSummary = "สร้าง Test Case (Initial test case)";
        boolean isNew = (request.getId() == null);

        if (state == EntityState.DELETED) {
            delete(request.getId(), businessId, userId);
            return request.getId();
        } else if (isNew) {
            entity = new PmTestCase();
            entity.setBusinessId(businessId);
            entity.setCreatedBy(userId);
            entity.setCreatedDate(Instant.now());
            mapRequestToEntity(request, entity);
            entity = testCaseRepository.save(entity);

            try {
                auditLogService.log("CREATE_TEST_CASE", "Test Management / Test Case",
                        "สร้าง Test Case: " + entity.getTitle() + " (" + entity.getTestCaseCode() + ")",
                        "TEST_CASE", entity.getId(), null, null, "Success", null);
            } catch (Exception e) {
                log.error("ผิดพลาด audit log CREATE_TEST_CASE: {}", e.getMessage(), e);
            }
        } else {
            entity = testCaseRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบ Test Case"));
            if (request.getRowVersion() != null && !request.getRowVersion().equals(entity.getRowVersion())) {
                throw new RuntimeException("ข้อมูลถูกแก้ไขโดยผู้อื่น กรุณารีเฟรชข้อมูล");
            }

            // ✅ Auto Diff Detection
            List<String> changes = new ArrayList<>();
            DocumentDiffHelper.checkChange(changes, "ชื่อ Test Case (Title)", entity.getTitle(), request.getTitle());
            DocumentDiffHelper.checkChange(changes, "ผลการทดสอบ (Status)", entity.getTestStatus(), request.getTestStatus());
            DocumentDiffHelper.checkChange(changes, "ความสำคัญ (Priority)", entity.getPriority(), request.getPriority());
            diffSummary = DocumentDiffHelper.buildDiffSummary(changes, "อัปเดต Test Case " + (request.getTitle() != null ? request.getTitle() : entity.getTitle()));

            mapRequestToEntity(request, entity);
            entity.setUpdatedBy(userId);
            entity.setUpdatedDate(Instant.now());
            entity = testCaseRepository.save(entity);

            try {
                auditLogService.log("UPDATE_TEST_CASE", "Test Management / Test Case",
                        "แก้ไข Test Case: " + entity.getTitle() + " (" + entity.getTestCaseCode() + ")",
                        "TEST_CASE", entity.getId(), null, null, "Success", null);
            } catch (Exception e) {
                log.error("ผิดพลาด audit log UPDATE_TEST_CASE: {}", e.getMessage(), e);
            }
        }

        // Snapshot data
        String snapshotJson = JsonSnapshotHelper.toJson(toResponse(entity));

        // ✅ Create document version
        documentVersionService.createVersion(
                "TEST_CASE",
                entity.getId(),
                entity.getProjectId(),
                entity.getTestCaseCode(),
                "v0.1",
                diffSummary,
                snapshotJson
        );

        // Auto-sync Task status based on Test Case result
        syncLinkedTaskStatus(entity);

        return entity.getId();
    }

    private void syncLinkedTaskStatus(PmTestCase entity) {
        if (entity.getTaskId() == null) return;
        try {
            taskRepository.findById(entity.getTaskId()).ifPresent(task -> {
                if (task.getIsDelete() != null && task.getIsDelete()) return;

                List<PmTestCase> allCases = testCaseRepository.findByTaskIdAndIsDeleteFalse(task.getId());
                if (allCases.isEmpty()) return;

                boolean anyFail = allCases.stream()
                        .anyMatch(tc -> "Fail".equalsIgnoreCase(tc.getTestStatus()) || "Failed".equalsIgnoreCase(tc.getTestStatus()));
                boolean allPass = allCases.stream()
                        .allMatch(tc -> "Pass".equalsIgnoreCase(tc.getTestStatus()) || "Passed".equalsIgnoreCase(tc.getTestStatus()));

                if (anyFail) {
                    // If any test case fails, push task to Waiting Fix
                    task.setStatus("Waiting Fix");
                    taskRepository.save(task);
                    log.info("Auto-updated Task {} status to 'Waiting Fix' due to failed test case", task.getId());
                } else if (allPass) {
                    // If all test cases pass, complete the task
                    task.setStatus("Done");
                    if (task.getActualEnd() == null) {
                        task.setActualEnd(Instant.now());
                    }
                    taskRepository.save(task);
                    log.info("Auto-updated Task {} status to 'Done' because all test cases passed", task.getId());
                }
            });
        } catch (Exception e) {
            log.error("Error auto-syncing task status from test case", e);
        }
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID businessId, String userId) {
        PmTestCase testCase = testCaseRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบ Test Case"));
        testCase.setIsDelete(true);
        testCase.setDeleteBy(userId);
        testCase.setDeleteDate(Instant.now());
        testCaseRepository.save(testCase);

        try {
            auditLogService.log("DELETE_TEST_CASE", "Test Management / Test Case",
                    "ลบ Test Case: " + testCase.getTitle() + " (" + testCase.getTestCaseCode() + ")",
                    "TEST_CASE", testCase.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log DELETE_TEST_CASE: {}", e.getMessage(), e);
        }
    }

    private void mapRequestToEntity(PmTestCaseRequest req, PmTestCase entity) {
        entity.setProjectId(req.getProjectId());
        entity.setScenarioId(req.getScenarioId());
        entity.setScenarioName(req.getScenarioName());
        entity.setTaskId(req.getTaskId());
        entity.setTestCaseCode(req.getTestCaseCode());
        entity.setTitle(req.getTitle());
        entity.setPriority(req.getPriority() != null ? req.getPriority() : "Medium");
        entity.setTestStep(req.getTestStep());
        entity.setExpectedResult(req.getExpectedResult());
        entity.setActualResult(req.getActualResult());
        entity.setTestStatus(req.getTestStatus() != null ? req.getTestStatus() : "Pending");
        entity.setTester(req.getTester());
        entity.setTestDate(req.getTestDate());
        entity.setRelatedRequirement(req.getRelatedRequirement());
        entity.setRelatedSpec(req.getRelatedSpec());
        entity.setRelatedTask(req.getRelatedTask());
    }

    private PmTestCaseResponse toResponse(PmTestCase entity) {
        PmTestCaseResponse res = new PmTestCaseResponse();
        res.setId(entity.getId());
        res.setProjectId(entity.getProjectId());
        res.setScenarioId(entity.getScenarioId());
        res.setScenarioName(entity.getScenarioName());
        if (res.getScenarioName() == null && entity.getScenarioId() != null) {
            scenarioRepository.findById(entity.getScenarioId()).ifPresent(sc -> {
                res.setScenarioName(sc.getScenarioName());
            });
        }
        res.setTestCaseCode(entity.getTestCaseCode());
        res.setTitle(entity.getTitle());
        res.setPriority(entity.getPriority());
        res.setTestStep(entity.getTestStep());
        res.setExpectedResult(entity.getExpectedResult());
        res.setActualResult(entity.getActualResult());
        res.setTestStatus(entity.getTestStatus());
        res.setTester(entity.getTester());
        res.setTestDate(entity.getTestDate());
        res.setRelatedRequirement(entity.getRelatedRequirement());
        res.setRelatedSpec(entity.getRelatedSpec());
        res.setRelatedTask(entity.getRelatedTask());
        res.setTaskId(entity.getTaskId());
        if (entity.getTaskId() != null) {
            taskRepository.findById(entity.getTaskId()).ifPresent(task -> {
                res.setTaskCode(task.getTaskCode());
                res.setTaskName(task.getTaskName());
                res.setTaskStatus(task.getStatus());
            });
        }
        res.setCreatedDate(entity.getCreatedDate());
        res.setUpdatedDate(entity.getUpdatedDate());
        res.setRowVersion(entity.getRowVersion());
        return res;
    }
}