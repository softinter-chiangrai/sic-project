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
public class PmBugServiceImpl implements PmBugService {

    private final PmBugRepository bugRepository;
    private final PmTaskRepository taskRepository;
    private final PmTestCaseRepository testCaseRepository;
    private final TraceLinkService traceLinkService;

    @Override
    @Transactional(readOnly = true)
    public Page<PmBugResponse> findAll(UUID businessId, UUID projectId, String keyword, Pageable pageable) {
        // TODO: implement search by projectId
        return bugRepository.findByBusinessIdAndIsDeleteFalse(businessId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PmBugResponse findById(UUID id, UUID businessId) {
        PmBug bug = bugRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("Bug not found"));
        return toResponse(bug);
    }

    @Override
    @Transactional
    public UUID save(PmBugRequest request, UUID businessId, String userId) {
        PmBug bug;
        EntityState state = EntityState.values()[request.getState() != null ? request.getState() : 0];

        if (state == EntityState.ADDED || request.getId() == null) {
            bug = new PmBug();
            bug.setBusinessId(businessId);
            bug.setCreatedBy(userId);
            bug.setCreatedDate(Instant.now());
            bug.setIsDelete(false);
            bug.setStatus("Open");
            mapRequestToEntity(request, bug);
            bug = bugRepository.save(bug);

            // ===== สร้าง Trace Link =====
            UUID projectId = businessId; // fallback

            if (request.getTaskId() != null) {
                traceLinkService.createLink(
                    projectId,
                    "TASK", request.getTaskId(),
                    "BUG", bug.getId(),
                    TraceRelationship.FAILED_BY.name()
                );
            }

            if (request.getTestCaseId() != null) {
                traceLinkService.createLink(
                    projectId,
                    "TEST_CASE", request.getTestCaseId(),
                    "BUG", bug.getId(),
                    TraceRelationship.FAILED_BY.name()
                );
            }

        } else if (state == EntityState.MODIFIED) {
            bug = bugRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("Bug not found"));
            if (request.getRowVersion() != null && !request.getRowVersion().equals(bug.getRowVersion())) {
                throw new RuntimeException("Record has been modified by another user. Please refresh and try again.");
            }
            bug.setUpdatedBy(userId);
            bug.setUpdatedDate(Instant.now());
            mapRequestToEntity(request, bug);
            bug = bugRepository.save(bug);

        } else if (state == EntityState.DELETED) {
            bug = bugRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("Bug not found"));
            bug.setIsDelete(true);
            bug.setDeleteBy(userId);
            bug.setDeleteDate(Instant.now());
            bugRepository.save(bug);
            return bug.getId();

        } else {
            throw new IllegalArgumentException("Invalid state: " + state);
        }

        return bug.getId();
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID businessId, String userId) {
        PmBug bug = bugRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("Bug not found"));
        bug.setIsDelete(true);
        bug.setDeleteBy(userId);
        bug.setDeleteDate(Instant.now());
        bugRepository.save(bug);
    }

    private void mapRequestToEntity(PmBugRequest request, PmBug entity) {
        entity.setBugCode(request.getBugCode());
        entity.setTitle(request.getTitle());
        entity.setDescription(request.getDescription());
        entity.setSeverity(request.getSeverity());
        entity.setPriority(request.getPriority());
        entity.setFoundBy(request.getFoundBy());
        entity.setAssignedTo(request.getAssignedTo());
        entity.setFoundDate(request.getFoundDate());
        entity.setFixDueDate(request.getFixDueDate());
        entity.setFixedDate(request.getFixedDate());
        entity.setStatus(request.getStatus() != null ? request.getStatus() : "Open");
        entity.setRelatedSpec(request.getRelatedSpec());

        if (request.getTaskId() != null) {
            PmTask task = taskRepository.findById(request.getTaskId()).orElse(null);
            entity.setTaskId(request.getTaskId());
        }

        if (request.getTestCaseId() != null) {
            PmTestCase testCase = testCaseRepository.findById(request.getTestCaseId()).orElse(null);
            entity.setTestCaseId(request.getTestCaseId());
        }
    }

    private PmBugResponse toResponse(PmBug entity) {
        PmBugResponse dto = new PmBugResponse();
        dto.setId(entity.getId());
        dto.setBugCode(entity.getBugCode());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setSeverity(entity.getSeverity());
        dto.setPriority(entity.getPriority());
        dto.setFoundBy(entity.getFoundBy());
        dto.setAssignedTo(entity.getAssignedTo());
        dto.setFoundDate(entity.getFoundDate());
        dto.setFixDueDate(entity.getFixDueDate());
        dto.setFixedDate(entity.getFixedDate());
        dto.setStatus(entity.getStatus());
        dto.setRelatedSpec(entity.getRelatedSpec());
        dto.setCreatedDate(entity.getCreatedDate());
        dto.setUpdatedDate(entity.getUpdatedDate());
        dto.setRowVersion(entity.getRowVersion());
        return dto;
    }
}