package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.PmRequirementRequest;
import com.softinter.sicapi.dto.response.PmRequirementResponse;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.service.PmRequirementService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PmRequirementServiceImpl implements PmRequirementService {

    private final PmRequirementRepository requirementRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<PmRequirementResponse> findAll(UUID businessId, UUID projectId, String keyword, String status, Pageable pageable) {
    Page<PmRequirement> page;
    if (keyword != null && !keyword.isBlank() && status != null && !status.isBlank()) {
        page = requirementRepository.searchByKeywordAndStatusAndProject(businessId, projectId, keyword, status, pageable);
    } else if (keyword != null && !keyword.isBlank()) {
        page = requirementRepository.searchByKeywordAndProject(businessId, projectId, keyword, pageable);
    } else if (status != null && !status.isBlank()) {
        page = requirementRepository.findAllByStatusAndProject(businessId, projectId, status, pageable);
    } else {
        page = requirementRepository.findAllByBusinessIdAndProjectId(businessId, projectId, pageable);
    }
    return page.map(this::toResponse);
}

    @Override
    @Transactional(readOnly = true)
    public PmRequirementResponse findById(UUID id, UUID businessId) {
        PmRequirement requirement = requirementRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new RuntimeException("Requirement not found"));
        return toResponse(requirement);
    }

    @Override
    @Transactional
    public UUID save(PmRequirementRequest request, UUID businessId, String userId) {
        PmRequirement requirement;
        EntityState state = EntityState.values()[request.getState()];

        if (state == EntityState.ADDED) {
            requirement = new PmRequirement();
            requirement.setBusinessId(businessId);
            requirement.setCreatedBy(userId);
            requirement.setCreatedDate(Instant.now());
            requirement.setIsDelete(false);
            requirement.setStatus("Draft");
            requirement.setIsActive(true);
            mapRequestToEntity(request, requirement);
            requirement = requirementRepository.save(requirement);
        } else if (state == EntityState.MODIFIED) {
            requirement = requirementRepository.findByIdAndBusinessId(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("Requirement not found"));
            // check rowVersion
            if (request.getRowVersion() != null && !request.getRowVersion().equals(requirement.getRowVersion())) {
                throw new RuntimeException("Record has been modified by another user. Please refresh and try again.");
            }
            requirement.setUpdatedBy(userId);
            requirement.setUpdatedDate(Instant.now());
            mapRequestToEntity(request, requirement);
            requirement = requirementRepository.save(requirement);
        } else if (state == EntityState.DELETED) {
            requirement = requirementRepository.findByIdAndBusinessId(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("Requirement not found"));
            requirement.setIsDelete(true);
            requirement.setIsActive(false);
            requirement.setDeleteBy(userId);
            requirement.setDeleteDate(Instant.now());
            requirementRepository.save(requirement);
            return requirement.getId();
        } else {
            throw new IllegalArgumentException("Invalid state: " + state);
        }
        return requirement.getId();
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID businessId, String userId) {
        PmRequirement requirement = requirementRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new RuntimeException("Requirement not found"));
        requirement.setIsDelete(true);
        requirement.setIsActive(false);
        requirement.setDeleteBy(userId);
        requirement.setDeleteDate(Instant.now());
        requirementRepository.save(requirement);
    }

    private void mapRequestToEntity(PmRequirementRequest request, PmRequirement entity) {
        entity.setRequirementCode(request.getRequirementCode());
        entity.setTitle(request.getTitle());
        entity.setDescription(request.getDescription());
        entity.setRequirementType(request.getRequirementType());
        entity.setSource(request.getSource());
        entity.setPriority(request.getPriority());
        entity.setBusinessValue(request.getBusinessValue());
        entity.setAcceptanceCriteria(request.getAcceptanceCriteria());
        entity.setProjectId(request.getProjectId());
        entity.setVersion(request.getVersion());
        entity.setStatus(request.getStatus());
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }
    }

    private PmRequirementResponse toResponse(PmRequirement entity) {
        PmRequirementResponse response = new PmRequirementResponse();
        response.setId(entity.getId());
        response.setRequirementCode(entity.getRequirementCode());
        response.setTitle(entity.getTitle());
        response.setDescription(entity.getDescription());
        response.setRequirementType(entity.getRequirementType());
        response.setSource(entity.getSource());
        response.setPriority(entity.getPriority());
        response.setBusinessValue(entity.getBusinessValue());
        response.setAcceptanceCriteria(entity.getAcceptanceCriteria());
        response.setProjectId(entity.getProjectId());
        if (entity.getProject() != null) {
            response.setProjectName(entity.getProject().getProjectName());
        }
        response.setCreatedBy(entity.getCreatedBy());
        response.setVersion(entity.getVersion());
        response.setStatus(entity.getStatus());
        response.setIsActive(entity.getIsActive());
        response.setCreatedDate(entity.getCreatedDate());
        response.setUpdatedDate(entity.getUpdatedDate());
        response.setRowVersion(entity.getRowVersion());
        return response;
    }
}