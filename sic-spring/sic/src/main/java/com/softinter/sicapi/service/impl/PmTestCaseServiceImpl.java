package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmTestCaseRequest;
import com.softinter.sicapi.dto.response.PmTestCaseResponse;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.pm.PmTestCase;

import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.pm.PmTestCaseRepository;
import com.softinter.sicapi.repository.pm.PmTestScenarioRepository;
import com.softinter.sicapi.service.PmTestCaseService;
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

    @Override
    @Transactional(readOnly = true)
    public Page<PmTestCaseResponse> findAll(UUID businessId, UUID projectId, String keyword, Pageable pageable) {
        Specification<PmTestCase> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("businessId"), businessId));
            predicates.add(cb.isFalse(root.get("isDelete")));

            if (projectId != null) {
                predicates.add(cb.equal(root.get("projectId"), projectId));
            }

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("testCaseCode")), pattern),
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("testStep")), pattern),
                        cb.like(cb.lower(root.get("expectedResult")), pattern),
                        cb.like(cb.lower(root.get("tester")), pattern)
                ));
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

        if (state == EntityState.ADDED || request.getId() == null) {
            entity = new PmTestCase();
            entity.setBusinessId(businessId);
            entity.setCreatedBy(userId);
            entity.setCreatedDate(Instant.now());
            mapRequestToEntity(request, entity);
            entity = testCaseRepository.save(entity);
        } else if (state == EntityState.MODIFIED) {
            entity = testCaseRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบ Test Case"));
            if (request.getRowVersion() != null && !request.getRowVersion().equals(entity.getRowVersion())) {
                throw new RuntimeException("ข้อมูลถูกแก้ไขโดยผู้อื่น กรุณารีเฟรชข้อมูล");
            }
            mapRequestToEntity(request, entity);
            entity.setUpdatedBy(userId);
            entity.setUpdatedDate(Instant.now());
            entity = testCaseRepository.save(entity);
        } else if (state == EntityState.DELETED) {
            delete(request.getId(), businessId, userId);
            return request.getId();
        } else {
            entity = testCaseRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบ Test Case"));
        }
        return entity.getId();
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
            });
        }
        res.setCreatedDate(entity.getCreatedDate());
        res.setUpdatedDate(entity.getUpdatedDate());
        res.setRowVersion(entity.getRowVersion());
        return res;
    }
}