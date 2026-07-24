package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmSpecificationRequest;
import com.softinter.sicapi.dto.response.PmSpecificationResponse;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.enums.TraceRelationship;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.entity.pm.PmSpecification;
import com.softinter.sicapi.entity.pm.PmTraceLink;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationRepository;
import com.softinter.sicapi.repository.pm.PmTraceLinkRepository;
import com.softinter.sicapi.service.PmSpecificationService;
import com.softinter.sicapi.service.TraceLinkService;
import com.softinter.sicapi.util.LocalizationHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PmSpecificationServiceImpl implements PmSpecificationService {

    private final PmSpecificationRepository specRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final PmRequirementRepository requirementRepository;
    private final TraceLinkService traceLinkService;

    @Override
    @Transactional(readOnly = true)
    public Page<PmSpecificationResponse> findAll(UUID businessId, UUID projectId, String keyword, Pageable pageable) {
        Page<PmSpecification> page;
        if (projectId != null) {
            page = specRepository.findByProjectIdAndBusinessIdAndIsDeleteFalse(projectId, businessId, pageable);
        } else {
            page = specRepository.findByBusinessIdAndIsDeleteFalse(businessId, pageable);
        }
        return page.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PmSpecificationResponse findById(UUID id, UUID businessId) {
        PmSpecification spec = specRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("Specification not found"));
        return toResponse(spec);
    }

    @Override
    @Transactional
    public UUID save(PmSpecificationRequest request, UUID businessId, String userId) {
        PmSpecification spec;
        EntityState state = request.getState() != null ? EntityState.values()[request.getState()] : EntityState.DETACHED;

        // Load requirement if provided
        PmRequirement requirement = null;
        if (request.getRequirementId() != null) {
            requirement = requirementRepository.findById(request.getRequirementId())
                    .orElseThrow(() -> new RuntimeException("Requirement not found"));
        }

        if (state == EntityState.ADDED || request.getId() == null) {
            // Create new
            spec = new PmSpecification();
            spec.setBusinessId(businessId);
            spec.setCreatedBy(userId);
            spec.setCreatedDate(Instant.now());
            spec.setIsDelete(false);
            spec.setStatus("Draft");
            spec.setVersion("1.0");
            spec.setIsActive(true);
            mapRequestToEntity(request, spec, requirement);
            spec = specRepository.save(spec);

            // Create trace link to requirement (if any)
            if (requirement != null) {
                traceLinkService.createLink(
                        request.getProjectId(),
                        "REQUIREMENT", requirement.getId(),
                        "SPECIFICATION", spec.getId(),
                        TraceRelationship.DOCUMENTED_BY
                );
            }

        } else if (state == EntityState.MODIFIED) {
            spec = specRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("Specification not found"));

            if (request.getRowVersion() != null && !request.getRowVersion().equals(spec.getRowVersion())) {
                throw new RuntimeException("Record has been modified by another user. Please refresh and try again.");
            }

            // Handle version increment
            String currentVersion = spec.getVersion() != null ? spec.getVersion() : "1.0";
            String newVersion = incrementVersion(currentVersion);
            spec.setVersion(newVersion);

            spec.setUpdatedBy(userId);
            spec.setUpdatedDate(Instant.now());

            // Remove old trace link to requirement if requirement changed
            UUID oldRequirementId = spec.getRequirement() != null ? spec.getRequirement().getId() : null;
            if (oldRequirementId != null && !oldRequirementId.equals(request.getRequirementId())) {
                // Delete old link
                traceLinkService.deleteLinksBySourceAndTarget(
                        "REQUIREMENT", oldRequirementId,
                        "SPECIFICATION", spec.getId()
                );
            }

            mapRequestToEntity(request, spec, requirement);

            // Create new trace link to requirement if provided and different
            if (requirement != null && !requirement.getId().equals(oldRequirementId)) {
                traceLinkService.createLink(
                        request.getProjectId(),
                        "REQUIREMENT", requirement.getId(),
                        "SPECIFICATION", spec.getId(),
                        TraceRelationship.DOCUMENTED_BY
                );
            }

            spec = specRepository.save(spec);

        } else if (state == EntityState.DELETED) {
            spec = specRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("Specification not found"));
            spec.setIsDelete(true);
            spec.setIsActive(false);
            spec.setDeleteBy(userId);
            spec.setDeleteDate(Instant.now());
            specRepository.save(spec);
            return spec.getId();
        } else {
            throw new IllegalArgumentException("Invalid state: " + state);
        }

        return spec.getId();
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID businessId, String userId) {
        PmSpecification spec = specRepository.findByIdAndBusinessIdAndIsDeleteFalse(id, businessId)
                .orElseThrow(() -> new RuntimeException("Specification not found"));
        spec.setIsDelete(true);
        spec.setIsActive(false);
        spec.setDeleteBy(userId);
        spec.setDeleteDate(Instant.now());
        specRepository.save(spec);
    }

    private void mapRequestToEntity(PmSpecificationRequest request, PmSpecification entity, PmRequirement requirement) {
        entity.setProjectId(request.getProjectId());
        entity.setRequirement(requirement);
        entity.setSpecCode(request.getSpecCode());
        entity.setSpecType(request.getSpecType());
        entity.setTitle(request.getTitle());
        entity.setDescription(request.getDescription());
        entity.setRelatedRequirement(request.getRelatedRequirement());
        entity.setRelatedDiagram(request.getRelatedDiagram());
        entity.setUiAction(request.getUiAction());
        entity.setValidationRule(request.getValidationRule());
        entity.setPermission(request.getPermission());
        entity.setEstimatedManday(request.getEstimatedManday());
        entity.setDependency(request.getDependency());
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }
        // version handled separately
    }

    private String incrementVersion(String version) {
        try {
            String numPart = version;
            if (version.startsWith("v") || version.startsWith("V")) {
                numPart = version.substring(1);
            }
            double val = Double.parseDouble(numPart);
            val += 0.1;
            String newNum = String.format("%.1f", val);
            return (version.startsWith("v") || version.startsWith("V")) ? "v" + newNum : newNum;
        } catch (NumberFormatException e) {
            return "1.1";
        }
    }

    private PmSpecificationResponse toResponse(PmSpecification entity) {
        PmSpecificationResponse dto = new PmSpecificationResponse();
        dto.setId(entity.getId());
        dto.setProjectId(entity.getProjectId());
        if (entity.getProject() != null) {
            dto.setProjectName(entity.getProject().getProjectName());
        }
        if (entity.getRequirement() != null) {
            dto.setRequirementId(entity.getRequirement().getId());
            dto.setRequirementName(entity.getRequirement().getTitle());
        }
        dto.setSpecCode(entity.getSpecCode());
        dto.setSpecType(entity.getSpecType());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setRelatedRequirement(entity.getRelatedRequirement());
        dto.setRelatedDiagram(entity.getRelatedDiagram());
        dto.setUiAction(entity.getUiAction());
        dto.setValidationRule(entity.getValidationRule());
        dto.setPermission(entity.getPermission());
        dto.setEstimatedManday(entity.getEstimatedManday());
        dto.setDependency(entity.getDependency());
        dto.setStatus(entity.getStatus());
        dto.setVersion(entity.getVersion());
        dto.setIsActive(entity.getIsActive());
        dto.setRowVersion(entity.getRowVersion());

        // approval status? not implemented yet, can be added later
        return dto;
    }
}