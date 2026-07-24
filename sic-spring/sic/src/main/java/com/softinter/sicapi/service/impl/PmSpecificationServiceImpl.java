package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmSpecificationRequest;
import com.softinter.sicapi.dto.response.PmSpecificationResponse;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.enums.TraceRelationship;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.entity.pm.PmSpecification;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationRepository;
import com.softinter.sicapi.service.PmSpecificationService;
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
public class PmSpecificationServiceImpl implements PmSpecificationService {

    private final PmSpecificationRepository specRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final PmRequirementRepository requirementRepository;
    private final TraceLinkService traceLinkService;

    @Override
    @Transactional(readOnly = true)
    public Page<PmSpecificationResponse> findAll(UUID businessId, UUID projectId, String keyword, Pageable pageable) {
        // ✅ ใช้ method ที่มีอยู่
        return specRepository.findByProjectIdAndBusinessIdAndIsDeleteFalse(projectId, businessId, pageable)
                .map(this::toResponse);
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
        EntityState state = EntityState.values()[request.getState() != null ? request.getState() : 0];

        if (state == EntityState.ADDED || request.getId() == null) {
            spec = new PmSpecification();
            // ✅ ใช้ setBusinessId (มีอยู่ใน Entity แล้ว)
            spec.setBusinessId(businessId);
            spec.setCreatedBy(userId);
            spec.setCreatedDate(Instant.now());
            spec.setIsDelete(false);
            spec.setStatus("Draft");
            mapRequestToEntity(request, spec);
            spec = specRepository.save(spec);

            // ===== สร้าง Trace Links =====
            // ✅ ใช้ getProjectId() (มีอยู่ใน Entity แล้ว)
            UUID projectId = spec.getProjectId();

            // เชื่อมกับ Requirement
            if (request.getRequirementId() != null) {
                traceLinkService.createLink(
                    projectId,
                    "REQUIREMENT", request.getRequirementId(),
                    "SPECIFICATION", spec.getId(),
                    TraceRelationship.DOCUMENTED_BY
                );
            }

            // เชื่อมกับ ER
            if (request.getErId() != null) {
                traceLinkService.createLink(
                    projectId,
                    "ER", request.getErId(),
                    "SPECIFICATION", spec.getId(),
                    TraceRelationship.IMPLEMENTED_BY
                );
            }

        } else if (state == EntityState.MODIFIED) {
            spec = specRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("Specification not found"));
            if (request.getRowVersion() != null && !request.getRowVersion().equals(spec.getRowVersion())) {
                throw new RuntimeException("Record has been modified by another user. Please refresh and try again.");
            }
            spec.setUpdatedBy(userId);
            spec.setUpdatedDate(Instant.now());
            mapRequestToEntity(request, spec);
            spec = specRepository.save(spec);

        } else if (state == EntityState.DELETED) {
            spec = specRepository.findByIdAndBusinessIdAndIsDeleteFalse(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("Specification not found"));
            spec.setIsDelete(true);
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
        spec.setDeleteBy(userId);
        spec.setDeleteDate(Instant.now());
        specRepository.save(spec);
    }

    private void mapRequestToEntity(PmSpecificationRequest request, PmSpecification entity) {
        // ✅ ใช้ setProjectId (มีอยู่ใน Entity แล้ว)
        entity.setProjectId(request.getProjectId());
        entity.setSpecCode(request.getSpecCode());
        entity.setSpecType(request.getSpecType());
        entity.setTitle(request.getTitle());
        entity.setDescription(request.getDescription());
        entity.setRelatedRequirement(request.getRelatedRequirement());
        entity.setRelatedEr(request.getRelatedEr());
        entity.setUiAction(request.getUiAction());
        entity.setValidationRule(request.getValidationRule());
        entity.setPermission(request.getPermission());
        entity.setEstimatedManday(request.getEstimatedManday());
        entity.setDependency(request.getDependency());
        entity.setStatus(request.getStatus() != null ? request.getStatus() : "Draft");

        if (request.getRequirementId() != null) {
            PmRequirement req = requirementRepository.findById(request.getRequirementId()).orElse(null);
            entity.setRequirement(req);
        }
    }

    private PmSpecificationResponse toResponse(PmSpecification entity) {
        PmSpecificationResponse dto = new PmSpecificationResponse();
        dto.setId(entity.getId());
        dto.setProjectId(entity.getProjectId());
        if (entity.getProject() != null) {
            dto.setProjectName(entity.getProject().getProjectName());
        }
        dto.setSpecCode(entity.getSpecCode());
        dto.setSpecType(entity.getSpecType());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setRelatedRequirement(entity.getRelatedRequirement());
        dto.setRelatedEr(entity.getRelatedEr());
        dto.setUiAction(entity.getUiAction());
        dto.setValidationRule(entity.getValidationRule());
        dto.setPermission(entity.getPermission());
        dto.setEstimatedManday(entity.getEstimatedManday());
        dto.setDependency(entity.getDependency());
        dto.setStatus(entity.getStatus());
        dto.setCreatedDate(entity.getCreatedDate());
        dto.setUpdatedDate(entity.getUpdatedDate());
        dto.setRowVersion(entity.getRowVersion());
        return dto;
    }
}