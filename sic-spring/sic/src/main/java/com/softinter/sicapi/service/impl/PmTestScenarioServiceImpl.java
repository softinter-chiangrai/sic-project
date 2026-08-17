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
    private final PmTaskRepository taskRepository;
    private final TraceLinkService traceLinkService;

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
        EntityState state = request.getState() != null ? EntityState.values()[request.getState()] : EntityState.DETACHED;
        PmTestScenario entity;

        if (state == EntityState.ADDED || request.getId() == null) {
            entity = new PmTestScenario();
            entity.setBusinessId(businessId);
            entity.setCreatedBy(userId);
            entity.setCreatedDate(Instant.now());
            mapRequestToEntity(request, entity);
            entity = scenarioRepository.save(entity);
        } else if (state == EntityState.MODIFIED) {
            entity = scenarioRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบ Test Scenario"));
            if (request.getRowVersion() != null && !request.getRowVersion().equals(entity.getRowVersion())) {
                throw new RuntimeException("ข้อมูลถูกแก้ไขโดยผู้อื่น กรุณารีเฟรชข้อมูล");
            }
            mapRequestToEntity(request, entity);
            entity.setUpdatedBy(userId);
            entity.setUpdatedDate(Instant.now());
            entity = scenarioRepository.save(entity);
        } else if (state == EntityState.DELETED) {
            delete(request.getId(), businessId, userId);
            return request.getId();
        } else {
            entity = scenarioRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบ Test Scenario"));
        }

        // ===== สร้าง Trace Link กับ Task =====
        if (entity.getProjectId() != null && entity.getTaskId() != null) {
            try {
                traceLinkService.createLink(
                    entity.getProjectId(),
                    "TASK", entity.getTaskId(),
                    "TEST_SCENARIO", entity.getId(),
                    TraceRelationship.VERIFIED_BY
                );
            } catch (Exception e) {
                log.warn("Failed to create trace link for test scenario: {}", e.getMessage());
            }
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
    }

    private void mapRequestToEntity(PmTestScenarioRequest req, PmTestScenario entity) {
        entity.setProjectId(req.getProjectId());
        entity.setTestPlanId(req.getTestPlanId());
        entity.setTaskId(req.getTaskId());
        entity.setScenarioName(req.getScenarioName());
        entity.setDescription(req.getDescription());
        entity.setPrerequisite(req.getPrerequisite());
        entity.setStatus(req.getStatus() != null ? req.getStatus() : "Active");
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
        res.setScenarioName(entity.getScenarioName());
        res.setDescription(entity.getDescription());
        res.setPrerequisite(entity.getPrerequisite());
        res.setStatus(entity.getStatus());
        res.setCreatedDate(entity.getCreatedDate());
        res.setUpdatedDate(entity.getUpdatedDate());
        res.setRowVersion(entity.getRowVersion());
        return res;
    }
}
