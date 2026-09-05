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
import com.softinter.sicapi.service.ApprovalService;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.DocumentVersionService;
import com.softinter.sicapi.service.PmSpecificationService;
import com.softinter.sicapi.service.TraceLinkService;
import com.softinter.sicapi.service.AuditLogService;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.util.LocalizationHelper;
import com.softinter.sicapi.util.DocumentDiffHelper;
import com.softinter.sicapi.util.JsonSnapshotHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmSpecificationServiceImpl implements PmSpecificationService {

    private final PmSpecificationRepository specificationRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final PmRequirementRepository requirementRepository;
    private final PmTraceLinkRepository traceLinkRepository;
    private final SuProfileRepository profileRepository;
    private final TraceLinkService traceLinkService;
    private final CurrentUserService currentUserService;
    private final DocumentVersionService documentVersionService;
    private final AuditLogService auditLogService;
    private final ApprovalService approvalService;

    // ===== FIND ALL (with pagination) =====
    @Override
    @Transactional(readOnly = true)
    public Page<PmSpecificationResponse> findAll(UUID businessId, String keyword, String status, Pageable pageable) {
        Specification<PmSpecification> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("businessId"), businessId));
            predicates.add(cb.isFalse(root.get("isDelete")));

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("specificationCode")), pattern),
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("specificationType")), pattern)));
            }

            if (status != null && !status.isBlank() && !"all".equals(status)) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return specificationRepository.findAll(spec, pageable).map(this::toResponse);
    }

    // ===== FIND BY ID =====
    @Override
    @Transactional(readOnly = true)
    public PmSpecificationResponse findById(UUID id, UUID businessId) {
        PmSpecification spec = specificationRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบ Specification"));
        return toResponse(spec);
    }

    // ===== FIND BY CODE =====
    @Override
    @Transactional(readOnly = true)
    public PmSpecificationResponse getByCode(UUID businessId, String code) {
        PmSpecification spec = specificationRepository.findByBusinessIdAndSpecificationCode(businessId, code)
                .orElseThrow(() -> new RuntimeException("ไม่พบ Specification"));
        return toResponse(spec);
    }

    // ===== SAVE (Create / Update / Delete) =====
    @Override
    @Transactional
    public UUID save(PmSpecificationRequest request, UUID businessId, String userId) {
        PmSpecification spec;
        EntityState state = request.getState() != null
                ? EntityState.values()[request.getState()]
                : EntityState.DETACHED;
        boolean isNew = (request.getId() == null);

        // ----- SOFT DELETE -----
        if (state == EntityState.DELETED) {
            spec = specificationRepository.findByIdAndBusinessId(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบ Specification"));
            approvalService.assertNotApproved("SPECIFICATION", spec.getId());

            spec.setIsDelete(true);
            spec.setIsActive(false);
            spec.setDeleteBy(userId);
            spec.setDeleteDate(Instant.now());
            specificationRepository.save(spec);

            // ✅ Soft Delete Document Versions
            documentVersionService.deleteVersionsByDocument("SPECIFICATION", spec.getId());

            // ✅ Soft Delete Trace Links
            deleteTraceLinksForSpecification(spec.getId(), userId);

            // Audit Log
            try {
                auditLogService.log("DELETE_SPECIFICATION", "Specification Management",
                        "ลบ Specification: " + spec.getTitle() + " (" + spec.getSpecificationCode() + ")",
                        "SPEC", spec.getId(), null, null, "Success", null);
            } catch (Exception ex) {
                log.error("ผิดพลาด audit log DELETE_SPECIFICATION: {}", ex.getMessage(), ex);
            }

            return spec.getId();
        }

        // ----- CREATE NEW -----
        if (isNew) {
            if (request.getSpecificationCode() == null || request.getSpecificationCode().isBlank()) {
                long count = specificationRepository.countByProjectIdAndIsDeleteFalse(request.getProjectId()) + 1;
                request.setSpecificationCode("SPEC-" + String.format("%03d", count));
            }

            // ตรวจสอบรหัสซ้ำ (ในโครงการเดียวกัน)
            if (specificationRepository.existsByBusinessIdAndProjectIdAndSpecificationCodeAndIsDeleteFalse(
                    businessId, request.getProjectId(), request.getSpecificationCode())) {
                throw new RuntimeException("รหัส Specification นี้มีอยู่แล้วในโครงการนี้: " + request.getSpecificationCode());
            }

            spec = new PmSpecification();
            spec.setBusinessId(businessId);
            spec.setCreatedBy(userId);
            spec.setCreatedDate(Instant.now());
            spec.setIsDelete(false);
            spec.setVersion("v0.1");
            spec.setStatus("Draft");
            spec.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

            // Mapping ข้อมูล
            mapRequestToEntity(request, spec);

            // ตั้งค่า Project
            if (request.getProjectId() != null) {
                PmCustomerProject project = projectRepository.findById(request.getProjectId())
                        .orElseThrow(() -> new RuntimeException("ไม่พบโครงการ"));
                spec.setProject(project);
            }

            // ตั้งค่า Requirement
            UUID targetReqId = request.getRequirementId() != null ? request.getRequirementId()
                    : request.getGeneratedFromRequirementId();
            if (targetReqId != null) {
                PmRequirement requirement = requirementRepository.findById(targetReqId)
                        .orElseThrow(() -> new RuntimeException("ไม่พบ Requirement"));
                spec.setRequirement(requirement);
            }

            PmSpecification saved = specificationRepository.save(spec);

            // ✅ Create initial document version with snapshot & fileRefId
            UUID projIdForVersion = saved.getProject() != null ? saved.getProject().getId() : request.getProjectId();
            if (projIdForVersion != null) {
                documentVersionService.createVersion(
                        "SPEC",
                        saved.getId(),
                        projIdForVersion,
                        saved.getSpecificationCode(),
                        saved.getVersion() != null ? saved.getVersion() : "v1.0",
                        "สร้าง Specification เริ่มต้น (Initial specification)",
                        JsonSnapshotHelper.toJson(toResponse(saved)),
                        saved.getUploadGroupId(),
                        null
                );
            }

            // ✅ สร้าง Trace Link กับ Requirement (ถ้ามี)
            UUID projectIdForTrace = saved.getProject() != null ? saved.getProject().getId() : request.getProjectId();
            UUID reqId = request.getRequirementId() != null ? request.getRequirementId() : request.getGeneratedFromRequirementId();
            if (reqId != null) {
                if (requirementRepository.existsById(reqId)) {
                    traceLinkService.createLink(
                            projectIdForTrace,
                            "REQUIREMENT", reqId,
                            "SPECIFICATION", saved.getId(),
                            TraceRelationship.DOCUMENTED_BY);
                }
            }

            // ✅ สร้าง Trace Link กับ Diagram (ถ้ามี)
            if (request.getGeneratedFromDiagramId() != null) {
                traceLinkService.createLink(
                        projectIdForTrace,
                        "DIAGRAM", request.getGeneratedFromDiagramId(),
                        "SPECIFICATION", saved.getId(),
                        TraceRelationship.DESIGNED_BY);
            }

            // Audit Log
            try {
                auditLogService.log("CREATE_SPECIFICATION", "Specification Management",
                        "สร้าง Specification: " + saved.getTitle() + " (" + saved.getSpecificationCode() + ")",
                        "SPEC", saved.getId(), null, null, "Success", null);
            } catch (Exception ex) {
                log.error("ผิดพลาด audit log CREATE_SPECIFICATION: {}", ex.getMessage(), ex);
            }

            return saved.getId();
        } else {
            // ----- UPDATE EXISTING -----
            spec = specificationRepository.findByIdAndBusinessId(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบ Specification"));

            approvalService.assertNotApproved("SPECIFICATION", spec.getId());

            // ตรวจสอบ RowVersion
            if (request.getRowVersion() != null && !request.getRowVersion().equals(spec.getRowVersion())) {
                throw new RuntimeException("ข้อมูลมีการเปลี่ยนแปลงโดยผู้อื่น กรุณารีเฟรชหน้าเว็บ");
            }

            String oldVersion = spec.getVersion() != null ? spec.getVersion() : "v0.1";
            String oldStatus = spec.getStatus();

            // ✅ Auto Diff Detection
            List<String> changes = new ArrayList<>();
            DocumentDiffHelper.checkChange(changes, "ชื่อหัวข้อ (Title)", spec.getTitle(), request.getTitle());
            DocumentDiffHelper.checkChange(changes, "ประเภท (Type)", spec.getSpecificationType(), request.getSpecificationType());
            DocumentDiffHelper.checkChange(changes, "คำอธิบาย (Description)", spec.getDescription(), request.getDescription());
            DocumentDiffHelper.checkChange(changes, "สถานะ (Status)", spec.getStatus(), request.getStatus());
            DocumentDiffHelper.checkChange(changes, "ความสำคัญ (Priority)", spec.getPriority(), request.getPriority());
            DocumentDiffHelper.checkChange(changes, "ผู้รับผิดชอบ (Owner)", spec.getOwner(), request.getOwner());
            DocumentDiffHelper.checkChange(changes, "ประมาณการ Man-day (Estimated Manday)", spec.getEstimatedManday() != null ? spec.getEstimatedManday().toString() : null, request.getEstimatedManday() != null ? request.getEstimatedManday().toString() : null);

            String diffSummary = DocumentDiffHelper.buildDiffSummary(changes, request.getTitle());

            spec.setUpdatedBy(userId);
            spec.setUpdatedDate(Instant.now());

            // Mapping ข้อมูล
            mapRequestToEntity(request, spec);

            // ตั้งค่า Requirement (ถ้ามีการส่งมาในการแก้ไข)
            UUID targetReqId = request.getRequirementId() != null ? request.getRequirementId()
                    : request.getGeneratedFromRequirementId();
            if (targetReqId != null) {
                PmRequirement requirement = requirementRepository.findById(targetReqId)
                        .orElseThrow(() -> new RuntimeException("ไม่พบ Requirement"));
                spec.setRequirement(requirement);
            }

            UUID projId = spec.getProject() != null ? spec.getProject().getId() : null;
            String newVersion = documentVersionService.incrementVersion(oldVersion);
            spec.setVersion(newVersion);

            // แก้ไขเอกสารจริง (มี field เปลี่ยนแปลง) ขณะที่เคยอนุมัติแล้ว หรือกำลังรออนุมัติอยู่
            // ต้องเปลี่ยนสถานะกลับเป็น "Changed" และยกเลิกคำขออนุมัติที่ค้างอยู่ (ถ้ามี) เพื่อขออนุมัติใหม่
            if (!changes.isEmpty()) {
                boolean pendingInvalidated = approvalService.invalidatePendingApproval(
                        "SPECIFICATION", spec.getId(), "เอกสารถูกแก้ไขระหว่างรอการอนุมัติ");
                if ("Approved".equalsIgnoreCase(oldStatus) || pendingInvalidated) {
                    spec.setStatus("Changed");
                }
            }
            spec = specificationRepository.save(spec);

            // ✅ สร้าง/อัปเดต Trace Link กับ Requirement
            UUID projectIdForTrace = spec.getProject() != null ? spec.getProject().getId() : request.getProjectId();
            if (targetReqId != null && requirementRepository.existsById(targetReqId)) {
                traceLinkService.createLink(
                        projectIdForTrace,
                        "REQUIREMENT", targetReqId,
                        "SPECIFICATION", spec.getId(),
                        TraceRelationship.DOCUMENTED_BY);
            }

            // Snapshot data
            String snapshotJson = JsonSnapshotHelper.toJson(toResponse(spec));

            documentVersionService.createVersion(
                    "SPEC",
                    spec.getId(),
                    projId,
                    spec.getSpecificationCode(),
                    newVersion,
                    diffSummary,
                    snapshotJson,
                    spec.getUploadGroupId(),
                    null
            );

            // Audit Log
            try {
                auditLogService.log("UPDATE_SPECIFICATION", "Specification Management",
                        "แก้ไข Specification: " + spec.getTitle() + " (" + spec.getSpecificationCode() + ")",
                        "SPEC", spec.getId(), null, null, "Success", null);
            } catch (Exception ex) {
                log.error("ผิดพลาด audit log UPDATE_SPECIFICATION: {}", ex.getMessage(), ex);
            }

            return spec.getId();
        }
    }

    // ===== DELETE =====
    @Override
    @Transactional
    public void delete(UUID id, UUID businessId, String userId) {
        PmSpecification spec = specificationRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new RuntimeException("ไม่พบ Specification"));

        spec.setIsDelete(true);
        spec.setIsActive(false);
        spec.setDeleteBy(userId);
        spec.setDeleteDate(Instant.now());
        specificationRepository.save(spec);

        // ✅ Soft Delete Document Versions
        documentVersionService.deleteVersionsByDocument("SPECIFICATION", spec.getId());

        // ✅ Soft Delete Trace Links
        deleteTraceLinksForSpecification(spec.getId(), userId);
    }

    private void deleteTraceLinksForSpecification(UUID specId, String userId) {
        // ลบ Trace Link ที่มี Specification นี้เป็น Source
        List<PmTraceLink> sourceLinks = traceLinkRepository.findBySourceTypeAndSourceId("SPECIFICATION", specId);
        for (PmTraceLink link : sourceLinks) {
            link.setIsDelete(true);
            link.setDeleteBy(userId);
            link.setDeleteDate(Instant.now());
            traceLinkRepository.save(link);
        }

        // ลบ Trace Link ที่มี Specification นี้เป็น Target
        List<PmTraceLink> targetLinks = traceLinkRepository.findByTargetTypeAndTargetId("SPECIFICATION", specId);
        for (PmTraceLink link : targetLinks) {
            link.setIsDelete(true);
            link.setDeleteBy(userId);
            link.setDeleteDate(Instant.now());
            traceLinkRepository.save(link);
        }
    }

    // ===== FIND BY BUSINESS AND PROJECT =====
    @Override
    @Transactional(readOnly = true)
    public List<PmSpecification> findByBusinessIdAndProjectId(UUID businessId, UUID projectId) {
        if (projectId != null) {
            return specificationRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(businessId, projectId);
        }
        return specificationRepository.findByBusinessIdAndIsDeleteFalse(businessId);
    }

    // ============================================================
    // PRIVATE HELPER METHODS
    // ============================================================

    private void mapRequestToEntity(PmSpecificationRequest request, PmSpecification entity) {
        entity.setSpecificationCode(request.getSpecificationCode());
        entity.setSpecificationType(request.getSpecificationType());
        entity.setTitle(request.getTitle());
        entity.setPriority(request.getPriority());
        entity.setOwner(request.getOwner());
        entity.setEstimatedManday(request.getEstimatedManday());
        entity.setDescription(request.getDescription()); // ✅ เนื้อหาทั้งหมดจาก Tiptap
        entity.setUploadGroupId(request.getUploadGroupId());

        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
        if (request.getVersion() != null) {
            entity.setVersion(request.getVersion());
        }

    }

    private PmSpecificationResponse toResponse(PmSpecification spec) {
        PmSpecificationResponse response = new PmSpecificationResponse();

        response.setId(spec.getId());
        response.setSpecificationCode(spec.getSpecificationCode());
        response.setSpecificationType(spec.getSpecificationType());
        response.setTitle(spec.getTitle());
        response.setVersion(spec.getVersion());
        response.setStatus(spec.getStatus());
        response.setIsLocked(approvalService.isApproved("SPECIFICATION", spec.getId()));
        response.setPriority(spec.getPriority());
        response.setOwner(spec.getOwner());
        response.setEstimatedManday(spec.getEstimatedManday());
        response.setDescription(spec.getDescription());  // ✅ เนื้อหาทั้งหมด
        response.setUploadGroupId(spec.getUploadGroupId());
        response.setIsActive(spec.getIsActive());

        // Project
        if (spec.getProject() != null) {
            response.setProjectId(spec.getProject().getId());
            response.setProjectName(spec.getProject().getProjectName());
        }

        // Requirement
        if (spec.getRequirement() != null) {
            response.setRequirementId(spec.getRequirement().getId());
            response.setRequirementCode(spec.getRequirement().getRequirementCode());
            response.setRequirementTitle(spec.getRequirement().getTitle());
        }

        String createdByName = profileRepository.findByUserId(spec.getCreatedBy())
                .map(LocalizationHelper::getFullName)
                .orElse(spec.getCreatedBy());
        response.setCreatedBy(createdByName);
        response.setRowVersion(spec.getRowVersion());
        response.setCreatedDate(spec.getCreatedDate());
        response.setUpdatedDate(spec.getUpdatedDate());

        return response;
    }
}