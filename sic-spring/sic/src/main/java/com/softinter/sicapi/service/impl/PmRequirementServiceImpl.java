package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

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
import com.softinter.sicapi.service.EditSessionService;
import com.softinter.sicapi.repository.su.SuUploadRepository;
import com.softinter.sicapi.service.FileStorageService;
import com.softinter.sicapi.entity.su.SuUpload;
import com.softinter.sicapi.entity.ex.StorageUploadReference;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PmRequirementServiceImpl implements PmRequirementService {

    private final PmRequirementRepository requirementRepository;
    private final EditSessionService editSessionService;
    private final SuUploadRepository uploadRepository;
    private final FileStorageService fileStorageService;

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

        List<StorageUploadReference> uploadRefs = request.getUploadGroupData() != null ? request.getUploadGroupData() : List.of();
        UUID finalUploadGroupId = resolveUploadGroupId(request.getUploadGroupId(), uploadRefs);

        if (state == EntityState.ADDED) {
            requirement = new PmRequirement();
            requirement.setBusinessId(businessId);
            requirement.setCreatedBy(userId);
            requirement.setCreatedDate(Instant.now());
            requirement.setIsDelete(false);
            requirement.setStatus("Draft");
            requirement.setIsActive(true);
            mapRequestToEntity(request, requirement);
            requirement.setUploadGroupId(finalUploadGroupId);
            requirement = requirementRepository.save(requirement);
        } else if (state == EntityState.MODIFIED) {
            requirement = requirementRepository.findByIdAndBusinessId(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("Requirement not found"));

            // Edit Guard: Check if the document status is NOT Draft, then require assignee rights.
            if (!"DRAFT".equalsIgnoreCase(requirement.getStatus())) {
                if (!editSessionService.canEdit("REQUIREMENT", requirement.getId(), userId)) {
                    throw new IllegalStateException("This document is locked because it is not in Draft. A Change Request is required to edit it.");
                }
            }

            // check rowVersion
            if (request.getRowVersion() != null && !request.getRowVersion().equals(requirement.getRowVersion())) {
                throw new RuntimeException("Record has been modified by another user. Please refresh and try again.");
            }
            requirement.setUpdatedBy(userId);
            requirement.setUpdatedDate(Instant.now());
            mapRequestToEntity(request, requirement);
            requirement.setUploadGroupId(finalUploadGroupId);
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

        // Sync Uploads
        if (finalUploadGroupId != null && uploadRefs != null && !uploadRefs.isEmpty()) {
            fileStorageService.syncUploads(finalUploadGroupId, uploadRefs);
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

        UUID uploadGroupId = entity.getUploadGroupId();
        response.setUploadGroupId(uploadGroupId);

        List<StorageUploadReference> uploadData = new ArrayList<>();
        if (uploadGroupId != null) {
            List<SuUpload> uploads = uploadRepository
                    .findAllByUploadGroupIdAndIsActiveTrueOrderByCreatedDateDesc(uploadGroupId);

            for (SuUpload upload : uploads) {
                StorageUploadReference ref = new StorageUploadReference();
                ref.setId(upload.getId());
                ref.setUploadGroupId(uploadGroupId);
                ref.setFileName(upload.getFileName());
                ref.setContentType(upload.getContentType());
                ref.setFileSize(upload.getFileSize());

                // TODO: ทำให้ baseUrl configurable
                String baseUrl = "http://localhost:5265";
                ref.setAccessUrl(baseUrl + "/api/storage/avatar/" + uploadGroupId);

                ref.setState(EntityState.DETACHED.getEntityStateCode());
                ref.setIsActive(upload.getIsActive());
                ref.setIsStreaming(upload.getIsStreaming() != null ? upload.getIsStreaming() : false);
                ref.setVisibility(mapVisibilityToString(upload.getVisibility()));

                uploadData.add(ref);
            }
        }
        response.setUploadGroupData(uploadData);

        return response;
    }

    private UUID resolveUploadGroupId(UUID existingGroupId, List<StorageUploadReference> references) {
        if (existingGroupId != null) {
            return existingGroupId;
        }
        if (references == null || references.isEmpty()) {
            return null;
        }
        for (StorageUploadReference ref : references) {
            if (ref.getUploadGroupId() != null) {
                return ref.getUploadGroupId();
            }
            if (ref.getId() != null) {
                SuUpload upload = uploadRepository.findById(ref.getId()).orElse(null);
                if (upload != null && upload.getUploadGroupId() != null) {
                    return upload.getUploadGroupId();
                }
            }
        }
        return null;
    }

    private String mapVisibilityToString(com.softinter.sicapi.entity.enums.FileVisibility visibility) {
        if (visibility == null) return "Public";
        switch (visibility) {
            case UPLOADER_ONLY: return "UploaderOnly";
            case BUSINESS_ONLY: return "BusinessOnly";
            case ANYONE_WITH_LINK: return "AnyoneWithLink";
            case PUBLIC: return "Public";
            default: return "Public";
        }
    }
}