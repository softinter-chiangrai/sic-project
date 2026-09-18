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
            entity.setProjectId(req.getProjectId());
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
}