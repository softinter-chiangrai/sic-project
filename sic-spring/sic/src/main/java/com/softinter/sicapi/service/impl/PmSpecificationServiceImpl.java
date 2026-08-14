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
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.DocumentVersionService;
import com.softinter.sicapi.service.EditSessionService;
import com.softinter.sicapi.service.PmSpecificationService;
import com.softinter.sicapi.service.TraceLinkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
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
    private final TraceLinkService traceLinkService;
    private final CurrentUserService currentUserService;
    private final EditSessionService editSessionService;
    private final DocumentVersionService documentVersionService;

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
                        cb.like(cb.lower(root.get("specificationType")), pattern)
                ));
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

        // ----- CREATE NEW -----
        if (state == EntityState.ADDED || request.getId() == null) {
            // ตรวจสอบรหัสซ้ำ
            if (specificationRepository.existsByBusinessIdAndSpecificationCodeAndIsDeleteFalse(
                    businessId, request.getSpecificationCode())) {
                throw new RuntimeException("รหัส Specification นี้มีอยู่แล้ว: " + request.getSpecificationCode());
            }

            spec = new PmSpecification();
            spec.setBusinessId(businessId);
            spec.setCreatedBy(userId);
            spec.setCreatedDate(Instant.now());
            spec.setIsDelete(false);
            spec.setVersion("v1.0");
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
            UUID targetReqId = request.getRequirementId() != null ? request.getRequirementId() : request.getGeneratedFromRequirementId();
            if (targetReqId != null) {
                PmRequirement requirement = requirementRepository.findById(targetReqId)
                        .orElseThrow(() -> new RuntimeException("ไม่พบ Requirement"));
                spec.setRequirement(requirement);
            }

            spec = specificationRepository.save(spec);

            // ✅ สร้าง Document Version ผ่าน DocumentVersionService
            documentVersionService.createVersion(
                    "SPECIFICATION",
                    spec.getId(),
                    spec.getVersion(),
                    "สร้าง Specification ฉบับแรก"
            );

            // ✅ สร้าง Trace Link กับ Requirement (ถ้ามี)
            UUID projectIdForTrace = spec.getProject() != null ? spec.getProject().getId() : request.getProjectId();
            if (request.getGeneratedFromRequirementId() != null) {
                UUID reqId = request.getGeneratedFromRequirementId();
                if (requirementRepository.existsById(reqId)) {
                    traceLinkService.createLink(
                            projectIdForTrace,
                            "REQUIREMENT", reqId,
                            "SPECIFICATION", spec.getId(),
                            TraceRelationship.DOCUMENTED_BY
                    );
                }
            }

            // ✅ สร้าง Trace Link กับ Diagram (ถ้ามี)
            if (request.getGeneratedFromDiagramId() != null) {
                traceLinkService.createLink(
                        projectIdForTrace,
                        "DIAGRAM", request.getGeneratedFromDiagramId(),
                        "SPECIFICATION", spec.getId(),
                        TraceRelationship.DESIGNED_BY
                );
            }

            return spec.getId();
        }

        // ----- UPDATE EXISTING -----
        if (state == EntityState.MODIFIED) {
            spec = specificationRepository.findByIdAndBusinessId(request.getId(), businessId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบ Specification"));

            // Edit Guard: ถ้าไม่ใช่ Draft และไม่มีสิทธิ์แก้ไข
            if (!"DRAFT".equalsIgnoreCase(spec.getStatus())) {
                if (!editSessionService.canEdit("SPECIFICATION", spec.getId(), userId)) {
                    throw new IllegalStateException(
                            "เอกสารนี้ถูกล็อกเนื่องจากไม่ใช่สถานะ Draft ต้องใช้ Change Request เพื่อแก้ไข"
                    );
                }
            }

            // ตรวจสอบ RowVersion
            if (request.getRowVersion() != null && !request.getRowVersion().equals(spec.getRowVersion())) {
                throw new RuntimeException("ข้อมูลมีการเปลี่ยนแปลงโดยผู้อื่น กรุณารีเฟรชหน้าเว็บ");
            }

            String oldVersion = spec.getVersion() != null ? spec.getVersion() : "v1.0";
            String oldStatus = spec.getStatus();

            spec.setUpdatedBy(userId);
            spec.setUpdatedDate(Instant.now());

            // Mapping ข้อมูล
            mapRequestToEntity(request, spec);

            // ✅ Increment Version ถ้าสถานะเปลี่ยนเป็น Approved หรือ Released
            if ("Approved".equals(request.getStatus()) || "Released".equals(request.getStatus())) {
                String newVersion = incrementVersion(oldVersion);
                spec.setVersion(newVersion);
                spec = specificationRepository.save(spec);

                documentVersionService.createVersion(
                        "SPECIFICATION",
                        spec.getId(),
                        newVersion,
                        "เปลี่ยนสถานะเป็น " + request.getStatus()
                );
            } else {
                // ✅ ทุกการอัปเดตจะเพิ่มเวอร์ชัน
                String newVersion = incrementVersion(oldVersion);
                spec.setVersion(newVersion);
                spec = specificationRepository.save(spec);

                documentVersionService.createVersion(
                        "SPECIFICATION",
                        spec.getId(),
                        newVersion,
                        request.getTitle() + " (อัปเดต)"
                );
            }

            return spec.getId();
        }

        // ----- SOFT DELETE -----
        if (state == EntityState.DELETED) {
            spec = specificationRepository.findByIdAndBusinessId(request.getId(), businessId)
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

            return spec.getId();
        }

        throw new IllegalArgumentException("Invalid state: " + state);
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
        entity.setDescription(request.getDescription());  // ✅ เนื้อหาทั้งหมดจาก Tiptap
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

        response.setRowVersion(spec.getRowVersion());
        response.setCreatedDate(spec.getCreatedDate());
        response.setUpdatedDate(spec.getUpdatedDate());

        return response;
    }

    private String incrementVersion(String currentVersion) {
        if (currentVersion == null || currentVersion.isBlank()) {
            return "v1.0";
        }
        try {
            String numPart = currentVersion;
            if (currentVersion.startsWith("v") || currentVersion.startsWith("V")) {
                numPart = currentVersion.substring(1);
            }
            double val = Double.parseDouble(numPart);
            val += 0.1;
            String newNum = String.format("%.1f", val);
            return (currentVersion.startsWith("v") || currentVersion.startsWith("V")) ? "v" + newNum : newNum;
        } catch (NumberFormatException e) {
            log.warn("ไม่สามารถเพิ่มเวอร์ชันได้: {}, ใช้ v1.0", currentVersion);
            return "v1.0";
        }
    }
}