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
import com.softinter.sicapi.service.DocumentVersionService;
import com.softinter.sicapi.service.AuditLogService;
import com.softinter.sicapi.repository.su.SuUploadRepository;
import com.softinter.sicapi.service.FileStorageService;
import com.softinter.sicapi.entity.su.SuUpload;
import com.softinter.sicapi.entity.ex.StorageUploadReference;

import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.service.ApprovalService;
import com.softinter.sicapi.util.DocumentDiffHelper;
import com.softinter.sicapi.util.JsonSnapshotHelper;
import com.softinter.sicapi.util.LocalizationHelper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmRequirementServiceImpl implements PmRequirementService {

    private final PmRequirementRepository requirementRepository;
    private final SuUploadRepository uploadRepository;
    private final FileStorageService fileStorageService;
    private final DocumentVersionService documentVersionService;
    private final SuProfileRepository profileRepository;
    private final AuditLogService auditLogService;
    private final ApprovalService approvalService;

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
    public PmRequirementResponse save(PmRequirementRequest request, UUID businessId, String userId) {
        PmRequirement requirement;
        EntityState state = EntityState.values()[request.getState() != null ? request.getState() : 0];

        List<StorageUploadReference> uploadRefs = request.getUploadGroupData() != null ? request.getUploadGroupData() : List.of();
        UUID finalUploadGroupId = resolveUploadGroupId(request.getUploadGroupId(), uploadRefs);

        boolean isNew = (request.getId() == null);

        if (state == EntityState.DELETED) {
            // ===== SOFT DELETE =====
            requirement = requirementRepository.findByIdAndBusinessId(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("Requirement not found"));
            requirement.setIsDelete(true);
            requirement.setIsActive(false);
            requirement.setDeleteBy(userId);
            requirement.setDeleteDate(Instant.now());
            requirementRepository.save(requirement);

            // ✅ Soft delete all versions
            documentVersionService.deleteVersionsByDocument("REQUIREMENT", requirement.getId());

            // Audit Log
            try {
                auditLogService.log("DELETE_REQUIREMENT", "Requirement Management",
                        "ลบ Requirement: " + requirement.getTitle() + " (" + requirement.getRequirementCode() + ")",
                        "REQUIREMENT", requirement.getId(), null, null, "Success", null);
            } catch (Exception e) {
                log.error("ผิดพลาด audit log DELETE_REQUIREMENT: {}", e.getMessage(), e);
            }
            return toResponse(requirement);

        } else if (isNew) {
            // ===== CREATE NEW =====
            requirement = new PmRequirement();
            requirement.setBusinessId(businessId);
            requirement.setCreatedBy(userId);
            requirement.setCreatedDate(Instant.now());
            requirement.setIsDelete(false);
            requirement.setStatus("Draft");
            requirement.setIsActive(true);
            requirement.setVersion("v1.0");
            mapRequestToEntity(request, requirement);
            requirement.setUploadGroupId(finalUploadGroupId);
            PmRequirement saved = requirementRepository.save(requirement);

            // Sync Uploads first before snapshot
            if (finalUploadGroupId != null && uploadRefs != null && !uploadRefs.isEmpty()) {
                fileStorageService.syncUploads(finalUploadGroupId, uploadRefs);
            }

            // ✅ Create initial document version with snapshot & fileRefId
            documentVersionService.createVersion(
                    "REQUIREMENT",
                    saved.getId(),
                    saved.getProjectId(),
                    saved.getRequirementCode(),
                    saved.getVersion() != null ? saved.getVersion() : "v1.0",
                    "สร้างข้อกำหนดเริ่มต้น (Initial requirement)",
                    JsonSnapshotHelper.toJson(toResponse(saved)),
                    finalUploadGroupId,
                    null
            );
            requirement = saved;

            // Audit Log
            try {
                auditLogService.log("CREATE_REQUIREMENT", "Requirement Management",
                        "สร้าง Requirement: " + saved.getTitle() + " (" + saved.getRequirementCode() + ")",
                        "REQUIREMENT", saved.getId(), null, null, "Success", null);
            } catch (Exception e) {
                log.error("ผิดพลาด audit log CREATE_REQUIREMENT: {}", e.getMessage(), e);
            }

        } else {
            // ===== UPDATE EXISTING =====
            requirement = requirementRepository.findByIdAndBusinessId(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("Requirement not found"));

            // check rowVersion
            if (request.getRowVersion() != null && !request.getRowVersion().equals(requirement.getRowVersion())) {
                throw new RuntimeException("Record has been modified by another user. Please refresh and try again.");
            }

            String oldStatus = requirement.getStatus();
            String oldVersion = requirement.getVersion();
            if (oldVersion == null) oldVersion = "v1.0";

            // ✅ Auto Diff Detection
            List<String> changes = new ArrayList<>();
            DocumentDiffHelper.checkChange(changes, "ชื่อความต้องการ (Title)", requirement.getTitle(), request.getTitle());
            DocumentDiffHelper.checkChange(changes, "รายละเอียด (Description)", requirement.getDescription(), request.getDescription());
            DocumentDiffHelper.checkChange(changes, "ประเภท (Type)", requirement.getRequirementType(), request.getRequirementType());
            DocumentDiffHelper.checkChange(changes, "ความสำคัญ (Priority)", requirement.getPriority(), request.getPriority());
            DocumentDiffHelper.checkChange(changes, "คุณค่าทางธุรกิจ (Business Value)", requirement.getBusinessValue(), request.getBusinessValue());
            DocumentDiffHelper.checkChange(changes, "เกณฑ์การยอมรับ (Acceptance Criteria)", requirement.getAcceptanceCriteria(), request.getAcceptanceCriteria());
            DocumentDiffHelper.checkChange(changes, "สถานะ (Status)", oldStatus, request.getStatus());

            String diffSummary = DocumentDiffHelper.buildDiffSummary(changes, request.getTitle());

            requirement.setUpdatedBy(userId);
            requirement.setUpdatedDate(Instant.now());
            mapRequestToEntity(request, requirement);

            // แก้ไขเอกสารจริง (มี field เปลี่ยนแปลง) ขณะที่เคยอนุมัติแล้ว หรือกำลังรออนุมัติอยู่
            // ต้องเปลี่ยนสถานะกลับเป็น "Changed" และยกเลิกคำขออนุมัติที่ค้างอยู่ (ถ้ามี) เพื่อขออนุมัติใหม่
            if (!changes.isEmpty()) {
                boolean pendingInvalidated = approvalService.invalidatePendingApproval(
                        "REQUIREMENT", requirement.getId(), "เอกสารถูกแก้ไขระหว่างรอการอนุมัติ");
                if ("Approved".equalsIgnoreCase(oldStatus) || pendingInvalidated) {
                    requirement.setStatus("Changed");
                }
            }

            // Version increment logic
            String newVersion = documentVersionService.incrementVersion(oldVersion);
            requirement.setVersion(newVersion);
            requirement.setUploadGroupId(finalUploadGroupId);

            requirementRepository.save(requirement);

            // Sync Uploads after save
            if (finalUploadGroupId != null && uploadRefs != null && !uploadRefs.isEmpty()) {
                fileStorageService.syncUploads(finalUploadGroupId, uploadRefs);
            }

            String snapshotJson = JsonSnapshotHelper.toJson(toResponse(requirement));

            // ✅ Create document version with diff summary & snapshot & fileRefId
            documentVersionService.createVersion(
                    "REQUIREMENT",
                    requirement.getId(),
                    requirement.getProjectId(),
                    requirement.getRequirementCode(),
                    newVersion,
                    diffSummary,
                    snapshotJson,
                    finalUploadGroupId,
                    null
            );

            // Audit Log
            try {
                auditLogService.log("UPDATE_REQUIREMENT", "Requirement Management",
                        "แก้ไข Requirement: " + requirement.getTitle() + " (" + requirement.getRequirementCode() + ")",
                        "REQUIREMENT", requirement.getId(), null, null, "Success", null);
            } catch (Exception e) {
                log.error("ผิดพลาด audit log UPDATE_REQUIREMENT: {}", e.getMessage(), e);
            }
        }

        return toResponse(requirement);
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

        // ✅ Soft delete all versions
        documentVersionService.deleteVersionsByDocument("REQUIREMENT", requirement.getId());
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
        if (request.getVersion() != null) {
            entity.setVersion(request.getVersion());
        }
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
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
            if (entity.getProject().getCustomerId() != null) {
                response.setCustomerId(entity.getProject().getCustomerId());
            }
            if (entity.getProject().getCustomer() != null) {
                String customerName = entity.getProject().getCustomer().getCompanyNameLocal();
                if (customerName == null || customerName.isBlank()) {
                    customerName = entity.getProject().getCustomer().getCompanyNameEn();
                }
                response.setCustomerName(customerName);
            }
        }
        String createdByName = profileRepository.findByUserId(entity.getCreatedBy())
                .map(LocalizationHelper::getFullName)
                .orElse(entity.getCreatedBy());
        response.setCreatedBy(createdByName);
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