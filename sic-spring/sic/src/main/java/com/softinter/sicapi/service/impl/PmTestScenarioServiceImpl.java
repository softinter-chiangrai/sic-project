package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmTestScenarioRequest;
import com.softinter.sicapi.dto.response.PmTestScenarioResponse;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.enums.TraceRelationship;
import com.softinter.sicapi.entity.pm.PmTestScenario;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.pm.PmTestScenarioRepository;
import com.softinter.sicapi.service.PmTestScenarioService;
import com.softinter.sicapi.service.TraceLinkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmTestScenarioServiceImpl implements PmTestScenarioService {

    private final PmTestScenarioRepository scenarioRepository;
    private final com.softinter.sicapi.repository.pm.PmTestCaseRepository testCaseRepository;
    private final PmTaskRepository taskRepository;
    private final TraceLinkService traceLinkService;
    private final com.softinter.sicapi.service.DocumentVersionService documentVersionService;

    @Override
    @Transactional(readOnly = true)
    public List<PmTestScenarioResponse> findByProject(UUID businessId, UUID projectId) {
        List<PmTestScenario> list;
        if (projectId != null) {
            list = scenarioRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(businessId, projectId);
        } else {
            list = scenarioRepository.findByBusinessIdAndIsDeleteFalse(businessId);
        }
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PmTestScenarioResponse findById(UUID id, UUID businessId) {
        PmTestScenario scenario = scenarioRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบ Test Scenario"));
        return toResponse(scenario);
    }

    @Override
    @Transactional
    public UUID save(PmTestScenarioRequest request, UUID businessId, String userId) {
        EntityState state = request.getState() != null ? EntityState.values()[request.getState()]
                : EntityState.DETACHED;
        PmTestScenario entity;
        boolean isNew = (request.getId() == null);
        String diffSummary = "สร้าง Test Scenario (Initial scenario)";

        if (state == EntityState.DELETED) {
            delete(request.getId(), businessId, userId);
            return request.getId();
        } else if (isNew) {
            entity = new PmTestScenario();
            entity.setBusinessId(businessId);
            entity.setCreatedBy(userId);
            entity.setCreatedDate(Instant.now());
            mapRequestToEntity(request, entity);
            entity = scenarioRepository.save(entity);
        } else {
            entity = scenarioRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบ Test Scenario"));
            if (request.getRowVersion() != null && !request.getRowVersion().equals(entity.getRowVersion())) {
                throw new RuntimeException("ข้อมูลถูกแก้ไขโดยผู้อื่น กรุณารีเฟรชข้อมูล");
            }
            // เทียบก่อน map (mapRequestToEntity เขียนทับทุก field) โดยใช้ค่าเริ่มต้นเดียวกับตอน map
            java.util.List<String> changes = new java.util.ArrayList<>();
            com.softinter.sicapi.util.DocumentDiffHelper.checkChange(changes, "รหัส Scenario", entity.getScenarioCode(), request.getScenarioCode());
            com.softinter.sicapi.util.DocumentDiffHelper.checkChange(changes, "ชื่อ Scenario", entity.getScenarioName(), request.getScenarioName());
            com.softinter.sicapi.util.DocumentDiffHelper.checkChange(changes, "รายละเอียด (Description)", entity.getDescription(), request.getDescription());
            com.softinter.sicapi.util.DocumentDiffHelper.checkChange(changes, "ความสำคัญ (Priority)", entity.getPriority(), request.getPriority() != null ? request.getPriority() : "Medium");
            com.softinter.sicapi.util.DocumentDiffHelper.checkChange(changes, "สถานะ (Status)", entity.getStatus(), request.getStatus() != null ? request.getStatus() : "Active");
            com.softinter.sicapi.util.DocumentDiffHelper.checkChange(changes, "ประเภทการทดสอบ (Test Type)", entity.getTestType(), request.getTestType() != null ? request.getTestType() : "SIT");
            diffSummary = com.softinter.sicapi.util.DocumentDiffHelper.buildDiffSummary(changes, "อัปเดต Test Scenario " + (request.getScenarioName() != null ? request.getScenarioName() : entity.getScenarioName()));

            mapRequestToEntity(request, entity);
            entity.setUpdatedBy(userId);
            entity.setUpdatedDate(Instant.now());
            entity = scenarioRepository.save(entity);
        }

        // ===== Cascade Sync testType, taskId, projectId to all child Test Cases =====
        try {
            List<com.softinter.sicapi.entity.pm.PmTestCase> childCases =
                    testCaseRepository.findByBusinessIdAndScenarioIdAndIsDeleteFalse(businessId, entity.getId());
            boolean needSave = false;
            for (com.softinter.sicapi.entity.pm.PmTestCase tc : childCases) {
                boolean changed = false;
                if (entity.getTestType() != null && !entity.getTestType().equalsIgnoreCase(tc.getTestType())) {
                    tc.setTestType(entity.getTestType());
                    changed = true;
                }
                if (entity.getTaskId() != null && (tc.getTaskId() == null || !entity.getTaskId().equals(tc.getTaskId()))) {
                    tc.setTaskId(entity.getTaskId());
                    changed = true;
                }
                if (entity.getProjectId() != null && (tc.getProjectId() == null || !entity.getProjectId().equals(tc.getProjectId()))) {
                    tc.setProjectId(entity.getProjectId());
                    changed = true;
                }
                if (changed) {
                    testCaseRepository.save(tc);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to cascade sync to test cases for scenario {}: {}", entity.getId(), e.getMessage());
        }

        // ===== สร้าง Trace Link กับ Task =====
        if (entity.getProjectId() != null && entity.getTaskId() != null) {
            try {
                traceLinkService.createLink(
                        entity.getProjectId(),
                        "TASK", entity.getTaskId(),
                        "TEST_SCENARIO", entity.getId(),
                        TraceRelationship.VERIFIED_BY);
            } catch (Exception e) {
                log.warn("Failed to create trace link for test scenario: {}", e.getMessage());
            }
        }

        try {
            documentVersionService.createVersion("TEST_SCENARIO", entity.getId(), entity.getProjectId(),
                    entity.getScenarioCode(), "v1.0.0", diffSummary,
                    com.softinter.sicapi.util.JsonSnapshotHelper.toJson(toResponse(entity)));
        } catch (Exception e) {
            log.warn("Failed to create version for test scenario {}: {}", entity.getId(), e.getMessage());
        }

        return entity.getId();
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID businessId, String userId) {
        PmTestScenario scenario = scenarioRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบ Test Scenario"));
        scenario.setIsDelete(true);
        scenario.setDeleteBy(userId);
        scenario.setDeleteDate(Instant.now());
        scenarioRepository.save(scenario);
        documentVersionService.deleteVersionsByDocument("TEST_SCENARIO", scenario.getId());
    }

    private void mapRequestToEntity(PmTestScenarioRequest req, PmTestScenario entity) {
        // ✅ derive projectId จาก Task เสมอถ้ามี taskId (ห้าม trust req.getProjectId() แยกต่างหาก)
        if (req.getTaskId() != null) {
            var task = taskRepository.findById(req.getTaskId())
                    .orElseThrow(() -> new RuntimeException("ไม่พบ Task"));
            entity.setProjectId(task.getWorkPackage().getMilestone().getPhase().getProject().getId());
        } else {
            entity.setProjectId(req.getProjectId());
        }
        entity.setTestPlanId(req.getTestPlanId());
        entity.setTaskId(req.getTaskId());
        entity.setScenarioCode(req.getScenarioCode());
        entity.setScenarioName(req.getScenarioName());
        entity.setPriority(req.getPriority() != null ? req.getPriority() : "Medium");
        entity.setDescription(req.getDescription());
        entity.setStatus(req.getStatus() != null ? req.getStatus() : "Active");
        entity.setTestType(req.getTestType() != null ? req.getTestType() : "SIT");
    }

    private PmTestScenarioResponse toResponse(PmTestScenario entity) {
        PmTestScenarioResponse res = new PmTestScenarioResponse();
        res.setId(entity.getId());
        res.setProjectId(entity.getProjectId());
        res.setTestPlanId(entity.getTestPlanId());
        res.setTaskId(entity.getTaskId());
        if (entity.getTaskId() != null) {
            taskRepository.findById(entity.getTaskId()).ifPresent(task -> {
                res.setTaskCode(task.getTaskCode());
                res.setTaskName(task.getTaskName());
            });
        }
        res.setScenarioCode(entity.getScenarioCode());
        res.setScenarioName(entity.getScenarioName());
        res.setPriority(entity.getPriority());
        res.setDescription(entity.getDescription());
        res.setStatus(entity.getStatus());
        res.setTestType(entity.getTestType() != null ? entity.getTestType() : "SIT");
        res.setCreatedDate(entity.getCreatedDate());
        res.setUpdatedDate(entity.getUpdatedDate());
        res.setRowVersion(entity.getRowVersion());
        return res;
    }
}
