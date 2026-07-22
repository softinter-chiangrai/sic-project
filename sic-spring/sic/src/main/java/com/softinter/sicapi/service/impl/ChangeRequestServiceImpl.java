package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.ChangeRequestRequest;
import com.softinter.sicapi.dto.response.ChangeRequestResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.entity.pm.PmRequirementChangeRequest;
import com.softinter.sicapi.repository.pm.PmRequirementChangeRequestRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.service.ChangeRequestService;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.ImpactAnalysisService;
import com.softinter.sicapi.util.PaginationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChangeRequestServiceImpl implements ChangeRequestService {

    private final PmRequirementChangeRequestRepository changeRequestRepository;
    private final PmRequirementRepository requirementRepository;
    private final CurrentUserService currentUserService;
     private final ImpactAnalysisService impactAnalysisService;

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ChangeRequestResponse> getChangeRequests(
            Specification<PmRequirementChangeRequest> spec,
            int page,
            int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
        Page<PmRequirementChangeRequest> pageResult = changeRequestRepository.findAll(spec, pageable);

        return PaginationUtil.of(
                pageResult.getContent().stream()
                        .map(this::toResponse)
                        .toList(),
                page,
                size,
                pageResult.getTotalElements()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ChangeRequestResponse getChangeRequestById(UUID id) {
        PmRequirementChangeRequest entity = changeRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Change Request not found"));
        return toResponse(entity);
    }

    @Override
    @Transactional
    public UUID createChangeRequest(ChangeRequestRequest request) {
        PmRequirement requirement = requirementRepository.findById(request.getRequirementId())
                .orElseThrow(() -> new RuntimeException("Requirement not found"));

        PmRequirementChangeRequest entity = new PmRequirementChangeRequest();
        entity.setRequirement(requirement);
        entity.setChangeDescription(request.getChangeDescription());
        entity.setImpactSummary(request.getImpactSummary());
        entity.setEstimatedManday(request.getEstimatedManday());
        entity.setStatus(request.getStatus() != null ? request.getStatus() : "Draft");
        entity.setCreatedBy(currentUserService.getUserId());
        entity.setCreatedDate(Instant.now());
        entity.setIsDelete(false);

        PmRequirementChangeRequest saved = changeRequestRepository.save(entity);
        log.info("Created Change Request with id: {}", saved.getId());
        
        try {
            impactAnalysisService.autoDetect(saved.getId());
            log.info("Auto-detect impact completed for change request: {}", saved.getId());
        } catch (Exception e) {
            log.warn("Auto-detect impact failed for change request: {}", saved.getId(), e);
        }

        return saved.getId();
    }

    @Override
    @Transactional
    public UUID updateChangeRequest(UUID id, ChangeRequestRequest request) {
        PmRequirementChangeRequest entity = changeRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Change Request not found"));

        // Optimistic Locking
        if (request.getRowVersion() != null && !request.getRowVersion().equals(entity.getRowVersion())) {
            throw new RuntimeException("Record has been modified by another user. Please refresh.");
        }

        entity.setChangeDescription(request.getChangeDescription());
        entity.setImpactSummary(request.getImpactSummary());
        entity.setEstimatedManday(request.getEstimatedManday());
        entity.setStatus(request.getStatus());
        entity.setUpdatedBy(currentUserService.getUserId());
        entity.setUpdatedDate(Instant.now());

        PmRequirementChangeRequest saved = changeRequestRepository.save(entity);
        log.info("Updated Change Request with id: {}", saved.getId());
        return saved.getId();
    }

    @Override
    @Transactional
    public void deleteChangeRequest(UUID id) {
        PmRequirementChangeRequest entity = changeRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Change Request not found"));

        entity.setIsDelete(true);
        entity.setDeleteBy(currentUserService.getUserId());
        entity.setDeleteDate(Instant.now());
        // ไม่มีฟิลด์ isActive

        changeRequestRepository.save(entity);
        log.info("Soft-deleted Change Request with id: {}", id);
    }

    @Override
    public ChangeRequestResponse toResponse(PmRequirementChangeRequest entity) {
        ChangeRequestResponse dto = new ChangeRequestResponse();
        dto.setId(entity.getId());
        dto.setChangeDescription(entity.getChangeDescription());
        dto.setImpactSummary(entity.getImpactSummary());
        dto.setEstimatedManday(entity.getEstimatedManday());
        dto.setStatus(entity.getStatus());
        dto.setCreatedDate(entity.getCreatedDate());

        if (entity.getRequirement() != null) {
            dto.setRequirementId(entity.getRequirement().getId());
            dto.setRequirementCode(entity.getRequirement().getRequirementCode());
            // projectId มาจาก requirement
            if (entity.getRequirement().getProject() != null) {
                dto.setProjectId(entity.getRequirement().getProject().getId());
                dto.setProjectName(entity.getRequirement().getProject().getProjectName());
            } else {
                dto.setProjectId(entity.getRequirement().getProjectId());
            }
        }
        return dto;
    }
}