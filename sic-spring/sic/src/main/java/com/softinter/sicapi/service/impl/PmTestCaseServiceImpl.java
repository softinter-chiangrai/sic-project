package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmTestCaseRequest;
import com.softinter.sicapi.dto.response.PmTestCaseResponse;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.enums.TraceRelationship;
import com.softinter.sicapi.entity.pm.PmTask;
import com.softinter.sicapi.entity.pm.PmTestCase;
import com.softinter.sicapi.entity.pm.PmTestScenario;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.pm.PmTestCaseRepository;
import com.softinter.sicapi.repository.pm.PmTestScenarioRepository;
import com.softinter.sicapi.service.PmTestCaseService;
import com.softinter.sicapi.service.TraceLinkService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PmTestCaseServiceImpl implements PmTestCaseService {

    private final PmTestCaseRepository testCaseRepository;
    private final PmTestScenarioRepository scenarioRepository;
    private final PmTaskRepository taskRepository;
    private final TraceLinkService traceLinkService;

    @Override
    @Transactional(readOnly = true)
    public Page<PmTestCaseResponse> findAll(UUID businessId, UUID projectId, String keyword, Pageable pageable) {
        // TODO: implement search
        return testCaseRepository.findByBusinessIdAndIsDeleteFalse(businessId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PmTestCaseResponse findById(UUID id, UUID businessId) {
        PmTestCase testCase = testCaseRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("Test Case not found"));
        return toResponse(testCase);
    }

    @Override
    @Transactional
    public UUID save(PmTestCaseRequest request, UUID businessId, String userId) {
        PmTestCase testCase;
        EntityState state = EntityState.values()[request.getState() != null ? request.getState() : 0];

        if (state == EntityState.ADDED || request.getId() == null) {
            testCase = new PmTestCase();
            testCase.setBusinessId(businessId);
            testCase.setCreatedBy(userId);
            testCase.setCreatedDate(Instant.now());
            testCase.setIsDelete(false);
            testCase.setTestStatus("Pending");
            mapRequestToEntity(request, testCase);
            testCase = testCaseRepository.save(testCase);

            // ===== สร้าง Trace Link =====
            if (request.getTaskId() != null) {
                UUID projectId = testCase.getTask() != null ? testCase.getTask().getBusinessId() : businessId;
                traceLinkService.createLink(
                    projectId,
                    "TASK", request.getTaskId(),
                    "TEST_CASE", testCase.getId(),
                    TraceRelationship.VERIFIED_BY
                );
            }

        } else if (state == EntityState.MODIFIED) {
            testCase = testCaseRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("Test Case not found"));
            if (request.getRowVersion() != null && !request.getRowVersion().equals(testCase.getRowVersion())) {
                throw new RuntimeException("Record has been modified by another user. Please refresh and try again.");
            }
            testCase.setUpdatedBy(userId);
            testCase.setUpdatedDate(Instant.now());
            mapRequestToEntity(request, testCase);
            testCase = testCaseRepository.save(testCase);

        } else if (state == EntityState.DELETED) {
            testCase = testCaseRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("Test Case not found"));
            testCase.setIsDelete(true);
            testCase.setDeleteBy(userId);
            testCase.setDeleteDate(Instant.now());
            testCaseRepository.save(testCase);
            return testCase.getId();

        } else {
            throw new IllegalArgumentException("Invalid state: " + state);
        }

        return testCase.getId();
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID businessId, String userId) {
        PmTestCase testCase = testCaseRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("Test Case not found"));
        testCase.setIsDelete(true);
        testCase.setDeleteBy(userId);
        testCase.setDeleteDate(Instant.now());
        testCaseRepository.save(testCase);
    }

    private void mapRequestToEntity(PmTestCaseRequest request, PmTestCase entity) {
        entity.setTestCaseCode(request.getTestCaseCode());
        entity.setTestStep(request.getTestStep());
        entity.setExpectedResult(request.getExpectedResult());
        entity.setActualResult(request.getActualResult());
        entity.setTestStatus(request.getTestStatus() != null ? request.getTestStatus() : "Pending");
        entity.setTester(request.getTester());
        entity.setTestDate(request.getTestDate());
        entity.setRelatedRequirement(request.getRelatedRequirement());
        entity.setRelatedSpec(request.getRelatedSpec());
        entity.setRelatedTask(request.getRelatedTask());

        if (request.getScenarioId() != null) {
            PmTestScenario scenario = scenarioRepository.findById(request.getScenarioId())
                    .orElseThrow(() -> new RuntimeException("Scenario not found"));
            entity.setScenario(scenario);
        }

        if (request.getTaskId() != null) {
            PmTask task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            entity.setTask(task);
        }
    }

    private PmTestCaseResponse toResponse(PmTestCase entity) {
        PmTestCaseResponse dto = new PmTestCaseResponse();
        dto.setId(entity.getId());
        dto.setScenarioId(entity.getScenario() != null ? entity.getScenario().getId() : null);
        dto.setScenarioName(entity.getScenario() != null ? entity.getScenario().getScenarioName() : null);
        dto.setTestCaseCode(entity.getTestCaseCode());
        dto.setTestStep(entity.getTestStep());
        dto.setExpectedResult(entity.getExpectedResult());
        dto.setActualResult(entity.getActualResult());
        dto.setTestStatus(entity.getTestStatus());
        dto.setTester(entity.getTester());
        dto.setTestDate(entity.getTestDate());
        dto.setRelatedRequirement(entity.getRelatedRequirement());
        dto.setRelatedSpec(entity.getRelatedSpec());
        dto.setRelatedTask(entity.getRelatedTask());
        dto.setCreatedDate(entity.getCreatedDate());
        dto.setUpdatedDate(entity.getUpdatedDate());
        dto.setRowVersion(entity.getRowVersion());
        return dto;
    }
}