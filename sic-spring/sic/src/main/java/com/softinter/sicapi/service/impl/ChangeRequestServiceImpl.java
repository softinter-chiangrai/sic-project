package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.ChangeRequestRequest;
import com.softinter.sicapi.dto.response.ChangeRequestResponse;
import com.softinter.sicapi.dto.response.CrAssigneeResponse;
import com.softinter.sicapi.dto.response.ChangeImpactResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.entity.pm.*;
import com.softinter.sicapi.repository.pm.*;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.service.*;
import com.softinter.sicapi.service.AuditLogService;
import com.softinter.sicapi.util.LocalizationHelper;
import com.softinter.sicapi.util.PaginationUtil;
import com.softinter.sicapi.util.JsonSnapshotHelper;
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
public class ChangeRequestServiceImpl implements ChangeRequestService {

    private final PmChangeRequestRepository changeRequestRepository;
    private final PmRequirementRepository requirementRepository;
    private final PmSpecificationRepository specificationRepository;
    private final PmTaskRepository taskRepository;
    private final SuProfileRepository profileRepository;
    private final CurrentUserService currentUserService;
    private final PmCrAssigneeRepository pmCrAssigneeRepository;
    private final PmChangeImpactRepository pmChangeImpactRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final ApprovalService approvalService;
    private final DocumentVersionService documentVersionService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public ChangeRequestResponse createChangeRequest(ChangeRequestRequest request) {
        validateTargetExists(request.getTargetType(), request.getTargetId());

        // ตรวจสอบสถานะเอกสารเป้าหมาย ห้ามเป็น DRAFT
        String docStatus = getDocumentStatus(request.getTargetType(), request.getTargetId());
        if ("DRAFT".equalsIgnoreCase(docStatus)) {
            throw new IllegalStateException("Draft documents can be edited directly without a Change Request.");
        }

        PmChangeRequest cr = new PmChangeRequest();
        UUID projId = request.getProjectId();
        if (projId == null && request.getTargetType() != null && request.getTargetId() != null) {
            if ("REQUIREMENT".equalsIgnoreCase(request.getTargetType())) {
                projId = requirementRepository.findById(request.getTargetId())
                        .map(r -> r.getProject() != null ? r.getProject().getId() : r.getProjectId())
                        .orElse(null);
            } else if ("SPECIFICATION".equalsIgnoreCase(request.getTargetType())) {
                projId = specificationRepository.findById(request.getTargetId())
                        .map(s -> s.getProject() != null ? s.getProject().getId() : null)
                        .orElse(null);
            }
        }
        cr.setProjectId(projId);
        if (request.getCrCode() != null && !request.getCrCode().isBlank()) {
            cr.setCrCode(request.getCrCode().trim());
        } else {
            long count = projId != null ? changeRequestRepository.countByProjectIdAndIsDeleteFalse(projId) + 1 : 1;
            cr.setCrCode("CR-" + String.format("%03d", count));
        }
        cr.setTargetType(request.getTargetType());
        cr.setTargetId(request.getTargetId());
        cr.setTitle(request.getTitle());
        cr.setDescription(request.getDescription());
        cr.setChangeReason(request.getChangeReason());
        cr.setRequesterId(currentUserService.getUserId());
        cr.setStatus("DRAFT");
        cr.setTargetVersion(resolveTargetVersion(request.getTargetType(), request.getTargetId(), request.getTargetVersion()));
        cr.setAssigneeId(request.getAssigneeId());
        cr.setCreatedBy(currentUserService.getUserId());
        cr.setCreatedDate(Instant.now());

        cr = changeRequestRepository.save(cr);

        // Snapshot data
        String snapshotJson = JsonSnapshotHelper.toJson(toResponse(cr));

        // ✅ Create document version
        documentVersionService.createVersion(
                "CHANGE_REQUEST",
                cr.getId(),
                cr.getProjectId(),
                cr.getTitle(),
                "v1.0",
                "สร้างคำขอเปลี่ยนแปลง (Initial change request)",
                snapshotJson
        );

        // บันทึก Assignees
        if (request.getAssignees() != null) {
            for (var aReq : request.getAssignees()) {
                PmCrAssignee assignee = new PmCrAssignee();
                assignee.setChangeRequest(cr);
                assignee.setUserId(aReq.getUserId());
                assignee.setTargetType(aReq.getTargetType());
                assignee.setTargetId(aReq.getTargetId());
                assignee.setStatus("PENDING");
                pmCrAssigneeRepository.save(assignee);
            }
        }

        logCrAudit("CREATE_CR", cr);

        return toResponse(cr);
    }

    private void logCrAudit(String action, PmChangeRequest cr) {
        try {
            auditLogService.log(action, "Change Request Management",
                    action.replace("_", " ") + " CR: " + cr.getTitle() + " (" + cr.getCrCode() + ")",
                    "CHANGE_REQUEST", cr.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log {}: {}", action, e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public ChangeRequestResponse updateChangeRequest(UUID id, ChangeRequestRequest request) {
        PmChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Change Request not found"));

        if (!"DRAFT".equals(cr.getStatus()) && !"SUBMITTED".equals(cr.getStatus())) {
            throw new IllegalStateException("Cannot update Change Request in status: " + cr.getStatus());
        }

        // ✅ Auto Diff Detection
        List<String> changes = new ArrayList<>();
        com.softinter.sicapi.util.DocumentDiffHelper.checkChange(changes, "รหัสคำขอ (CR Code)", cr.getCrCode(), request.getCrCode());
        com.softinter.sicapi.util.DocumentDiffHelper.checkChange(changes, "ชื่อคำขอ (Title)", cr.getTitle(), request.getTitle());
        com.softinter.sicapi.util.DocumentDiffHelper.checkChange(changes, "รายละเอียด (Description)", cr.getDescription(), request.getDescription());
        com.softinter.sicapi.util.DocumentDiffHelper.checkChange(changes, "เหตุผล (Reason)", cr.getChangeReason(), request.getChangeReason());
        com.softinter.sicapi.util.DocumentDiffHelper.checkChange(changes, "เป้าหมายเวอร์ชัน (Target Version)", cr.getTargetVersion(), request.getTargetVersion());
        String diffSummary = com.softinter.sicapi.util.DocumentDiffHelper.buildDiffSummary(changes, "อัปเดตคำขอเปลี่ยนแปลง " + (request.getTitle() != null ? request.getTitle() : cr.getTitle()));

        // แก้ไขเอกสารจริง (มี field เปลี่ยนแปลง) ขณะที่กำลังรออนุมัติอยู่ (SUBMITTED)
        // ต้องยกเลิกคำขออนุมัติที่ค้างอยู่ และดึงกลับเป็น "DRAFT" เพื่อขออนุมัติใหม่
        if (!changes.isEmpty() && "SUBMITTED".equals(cr.getStatus())) {
            boolean pendingInvalidated = approvalService.invalidatePendingApproval(
                    "CHANGE_REQUEST", cr.getId(), "เอกสารถูกแก้ไขระหว่างรอการอนุมัติ");
            if (pendingInvalidated) {
                cr.setStatus("DRAFT");
            }
        }

        if (request.getCrCode() != null && !request.getCrCode().isBlank()) {
            cr.setCrCode(request.getCrCode().trim());
        }
        cr.setTitle(request.getTitle());
        cr.setDescription(request.getDescription());
        cr.setChangeReason(request.getChangeReason());
        if (cr.getProjectId() == null) {
            UUID projId = request.getProjectId();
            if (projId == null && cr.getTargetType() != null && cr.getTargetId() != null) {
                if ("REQUIREMENT".equalsIgnoreCase(cr.getTargetType())) {
                    projId = requirementRepository.findById(cr.getTargetId())
                            .map(r -> r.getProject() != null ? r.getProject().getId() : r.getProjectId())
                            .orElse(null);
                } else if ("SPECIFICATION".equalsIgnoreCase(cr.getTargetType())) {
                    projId = specificationRepository.findById(cr.getTargetId())
                            .map(s -> s.getProject() != null ? s.getProject().getId() : null)
                            .orElse(null);
                }
            }
            if (projId != null) {
                cr.setProjectId(projId);
            }
        }
        cr.setTargetVersion(resolveTargetVersion(cr.getTargetType(), cr.getTargetId(), request.getTargetVersion()));
        cr.setAssigneeId(request.getAssigneeId());
        cr.setUpdatedBy(currentUserService.getUserId());
        cr.setUpdatedDate(Instant.now());

        // Snapshot data
        String snapshotJson = JsonSnapshotHelper.toJson(toResponse(cr));

        // ✅ Create document version
        documentVersionService.createVersion(
                "CHANGE_REQUEST",
                cr.getId(),
                cr.getProjectId(),
                cr.getTitle(),
                "v1.1",
                diffSummary,
                snapshotJson
        );

        // อัปเดต Assignees (ลบเดิม สร้างใหม่)
        List<PmCrAssignee> existing = pmCrAssigneeRepository.findByChangeRequestIdAndIsDeleteFalse(cr.getId());
        for (var a : existing) {
            a.setIsDelete(true);
            pmCrAssigneeRepository.save(a);
        }

        if (request.getAssignees() != null) {
            for (var aReq : request.getAssignees()) {
                PmCrAssignee assignee = new PmCrAssignee();
                assignee.setChangeRequest(cr);
                assignee.setUserId(aReq.getUserId());
                assignee.setTargetType(aReq.getTargetType());
                assignee.setTargetId(aReq.getTargetId());
                assignee.setStatus("PENDING");
                pmCrAssigneeRepository.save(assignee);
            }
        }

        cr = changeRequestRepository.save(cr);

        logCrAudit("UPDATE_CR", cr);

        return toResponse(cr);
    }

    @Override
    @Transactional(readOnly = true)
    public ChangeRequestResponse getChangeRequest(UUID id) {
        PmChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Change Request not found"));
        return toResponse(cr);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ChangeRequestResponse> listChangeRequests(UUID projectId, String targetType, UUID targetId, String status, Pageable pageable) {
        Specification<PmChangeRequest> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDelete")));

            if (projectId != null) {
                predicates.add(cb.equal(root.get("projectId"), projectId));
            }
            if (targetType != null) {
                predicates.add(cb.equal(root.get("targetType"), targetType));
            }
            if (targetId != null) {
                predicates.add(cb.equal(root.get("targetId"), targetId));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PmChangeRequest> page = changeRequestRepository.findAll(spec, pageable);
        List<ChangeRequestResponse> data = page.getContent().stream()
                .map(this::toResponse)
                .toList();

        return PaginationUtil.of(data, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Override
    @Transactional
    public void deleteChangeRequest(UUID id) {
        PmChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Change Request not found"));
        approvalService.assertNotApproved("CHANGE_REQUEST", cr.getId());
        cr.setIsDelete(true);
        cr.setDeleteBy(currentUserService.getUserId());
        cr.setDeleteDate(Instant.now());
        changeRequestRepository.save(cr);

        logCrAudit("DELETE_CR", cr);
    }

    @Override
    @Transactional
    public ChangeRequestResponse submitForApproval(UUID id) {
        PmChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Change Request not found"));

        if (!"DRAFT".equals(cr.getStatus())) {
            throw new IllegalStateException("Only DRAFT Change Request can be submitted.");
        }

        // ค้นหาหรือระบุ flow สำหรับอนุมัติ Change Request (สมมติว่าใช้ flow ตัวแรกที่ผูกกับ Change Request หรือกำหนดดีฟอลต์)
        // เนื่องจาก ApprovalServiceImpl มี helper `updateDocumentStatusOnSubmit` ที่จะคอยอัปเดตเป็น SUBMITTED ให้เมื่อ submit สำเร็จ
        // เราทำการเรียก submitForApproval ไปที่ ApprovalService
        String docCode = cr.getCrCode() != null && !cr.getCrCode().isBlank()
                ? cr.getCrCode()
                : "CR-" + cr.getId().toString().substring(0, 8).toUpperCase();
        com.softinter.sicapi.dto.request.ApprovalSubmitRequest submitReq = new com.softinter.sicapi.dto.request.ApprovalSubmitRequest();
        submitReq.setDocumentType("CHANGE_REQUEST");
        submitReq.setDocumentId(cr.getId());
        submitReq.setDocumentCode(docCode);
        submitReq.setDocumentTitle(cr.getTitle());
        submitReq.setComment("ส่งขออนุมัติ Change Request: " + cr.getTitle());
        
        approvalService.submitForApproval(submitReq);

        return toResponse(cr);
    }

    @Override
    @Transactional
    public ChangeRequestResponse approve(UUID id, String approvedBy) {
        PmChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Change Request not found"));

        cr.setStatus("APPROVED");
        cr.setApprovedBy(approvedBy);
        cr.setApprovedAt(Instant.now());
        cr.setUpdatedBy(currentUserService.getUserId());
        cr.setUpdatedDate(Instant.now());
        cr = changeRequestRepository.save(cr);

        // ปลดล็อคเอกสารเป้าหมาย (bump เวอร์ชัน + ตั้งสถานะกลับเป็นแก้ไขได้)
        approvalService.unlockDocumentAfterChange(cr.getTargetType(), cr.getTargetId(),
                "Change Request " + cr.getCrCode() + " approved");

        return toResponse(cr);
    }

    @Override
    @Transactional
    public ChangeRequestResponse reject(UUID id, String reason) {
        PmChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Change Request not found"));

        cr.setStatus("REJECTED");
        cr.setUpdatedBy(currentUserService.getUserId());
        cr.setUpdatedDate(Instant.now());
        if (reason != null && !reason.isBlank()) {
            cr.setDescription(cr.getDescription() + "\n[Rejected] " + reason);
        }
        cr = changeRequestRepository.save(cr);
        return toResponse(cr);
    }

    @Override
    @Transactional
    public ChangeRequestResponse implement(UUID id) {
        PmChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Change Request not found"));

        if (!"APPROVED".equals(cr.getStatus())) {
            throw new IllegalStateException("Only APPROVED Change Request can be implemented.");
        }

        cr.setStatus("IMPLEMENTED");
        cr.setImplementedAt(Instant.now());
        cr.setUpdatedBy(currentUserService.getUserId());
        cr.setUpdatedDate(Instant.now());
        cr = changeRequestRepository.save(cr);

        // ปลดล็อคเอกสารเป้าหมายทั้งหมด: bump เวอร์ชัน, ตั้งสถานะกลับเป็นแก้ไขได้,
        // และ deactivate PmApproval record เดิมที่ APPROVED อยู่
        String unlockReason = "Change Request " + cr.getCrCode() + " implemented";
        List<PmCrAssignee> assignees = pmCrAssigneeRepository.findByChangeRequestIdAndIsDeleteFalse(cr.getId());
        for (PmCrAssignee assignee : assignees) {
            approvalService.unlockDocumentAfterChange(assignee.getTargetType(), assignee.getTargetId(), unlockReason);
        }

        // สำหรับ target หลักของ CR เอง
        approvalService.unlockDocumentAfterChange(cr.getTargetType(), cr.getTargetId(), unlockReason);

        try {
            auditLogService.log(
                    "IMPLEMENT_CHANGE_REQUEST",
                    "Change Request / " + cr.getTargetType(),
                    "ดำเนินการตาม Change Request " + cr.getCrCode() + " และปลดล็อคเอกสารเป้าหมายเรียบร้อยแล้ว",
                    cr.getTargetType(),
                    cr.getTargetId(),
                    null, null, "Success",
                    "Implemented by: " + currentUserService.getUsername());
        } catch (Exception e) {
            log.error("Error creating audit log on implement CR: {}", e.getMessage(), e);
        }

        return toResponse(cr);
    }

    @Override
    @Transactional
    public ChangeRequestResponse markAssigneeComplete(UUID changeRequestId, String userId, UUID targetId) {
        PmCrAssignee assignee = pmCrAssigneeRepository.findByUserIdAndChangeRequestIdAndIsDeleteFalse(userId, changeRequestId)
                .orElseThrow(() -> new RuntimeException("Assignee not found for this user in the Change Request"));

        assignee.setStatus("COMPLETED");
        assignee.setCompletedAt(Instant.now());
        pmCrAssigneeRepository.save(assignee);

        // ปลดล็อคเอกสารของ Assignee คนนี้ (bump เวอร์ชัน + ตั้งสถานะกลับเป็นแก้ไขได้)
        approvalService.unlockDocumentAfterChange(assignee.getTargetType(), assignee.getTargetId(),
                "Change Request assignee completed their part");

        // ตรวจสอบว่าทุกคนทำเสร็จครบหรือยัง หากครบแล้วให้ปรับสถานะ CR เป็น IMPLEMENTED อัตโนมัติ
        List<PmCrAssignee> pending = pmCrAssigneeRepository.findByChangeRequestIdAndStatusAndIsDeleteFalse(changeRequestId, "PENDING");
        PmChangeRequest cr = changeRequestRepository.findById(changeRequestId)
                .orElseThrow(() -> new RuntimeException("Change Request not found"));
        if (pending.isEmpty()) {
            cr.setStatus("IMPLEMENTED");
            cr.setImplementedAt(Instant.now());
            changeRequestRepository.save(cr);
        }

        return toResponse(cr);
    }

    // ============================ Helper Methods ============================

    private String getDocumentStatus(String targetType, UUID targetId) {
        switch (targetType.toUpperCase()) {
            case "REQUIREMENT":
                return requirementRepository.findById(targetId).map(PmRequirement::getStatus).orElse("DRAFT");
            case "SPECIFICATION":
                return specificationRepository.findById(targetId).map(PmSpecification::getStatus).orElse("DRAFT");
            default:
                return "DRAFT";
        }
    }

    private void validateTargetExists(String targetType, UUID targetId) {
        switch (targetType.toUpperCase()) {
            case "REQUIREMENT":
                if (!requirementRepository.existsById(targetId)) {
                    throw new RuntimeException("Requirement not found: " + targetId);
                }
                break;
            case "SPECIFICATION":
                if (!specificationRepository.existsById(targetId)) {
                    throw new RuntimeException("Specification not found: " + targetId);
                }
                break;
            case "TASK":
                if (!taskRepository.existsById(targetId)) {
                    throw new RuntimeException("Task not found: " + targetId);
                }
                break;
            case "DFD":
            case "ER":
                break;
            default:
                throw new IllegalArgumentException("Unsupported target type: " + targetType);
        }
    }

    private ChangeRequestResponse toResponse(PmChangeRequest cr) {
        ChangeRequestResponse response = new ChangeRequestResponse();
        response.setId(cr.getId());
        response.setCrCode(cr.getCrCode());
        response.setProjectId(cr.getProjectId());
        if (cr.getProjectId() != null) {
            projectRepository.findById(cr.getProjectId())
                    .ifPresent(p -> response.setProjectName(p.getProjectName()));
        }
        response.setTargetType(cr.getTargetType());
        response.setTargetId(cr.getTargetId());
        response.setTitle(cr.getTitle());
        response.setDescription(cr.getDescription());
        response.setChangeReason(cr.getChangeReason());
        response.setRequesterId(cr.getRequesterId());
        response.setRequesterName(getUserName(cr.getRequesterId()));
        response.setAssigneeId(cr.getAssigneeId());
        response.setAssigneeName(getUserName(cr.getAssigneeId()));
        response.setStatus(cr.getStatus());
        response.setIsLocked(approvalService.isApproved("CHANGE_REQUEST", cr.getId()));
        String targetVer = cr.getTargetVersion();
        if (targetVer == null || targetVer.isBlank()) {
            targetVer = resolveTargetVersion(cr.getTargetType(), cr.getTargetId(), null);
        }
        response.setTargetVersion(targetVer != null ? targetVer : "-");
        response.setApprovedBy(cr.getApprovedBy());
        response.setApprovedAt(cr.getApprovedAt());
        response.setImplementedAt(cr.getImplementedAt());
        response.setCreatedDate(cr.getCreatedDate());

        List<PmCrAssignee> assignees = pmCrAssigneeRepository.findByChangeRequestIdAndIsDeleteFalse(cr.getId());
        response.setAssignees(assignees.stream().map(this::toAssigneeResponse).collect(Collectors.toList()));

        List<PmChangeImpact> impacts = pmChangeImpactRepository.findByChangeRequestIdAndIsDeleteFalse(cr.getId());
        response.setImpacts(impacts.stream().map(this::toImpactResponse).collect(Collectors.toList()));

        return response;
    }

    private String resolveTargetVersion(String targetType, UUID targetId, String requestedVersion) {
        if (requestedVersion != null && !requestedVersion.isBlank()) {
            return requestedVersion;
        }
        if (targetType == null || targetId == null) {
            return null;
        }
        switch (targetType.toUpperCase()) {
            case "REQUIREMENT":
                return requirementRepository.findById(targetId)
                        .map(r -> documentVersionService.incrementVersion(r.getVersion()))
                        .orElse("v1.1");
            case "SPECIFICATION":
                return specificationRepository.findById(targetId)
                        .map(s -> documentVersionService.incrementVersion(s.getVersion()))
                        .orElse("v1.1");
            default:
                return null;
        }
    }

    private CrAssigneeResponse toAssigneeResponse(PmCrAssignee a) {
        CrAssigneeResponse resp = new CrAssigneeResponse();
        resp.setId(a.getId());
        resp.setUserId(a.getUserId());
        resp.setUserName(getUserName(a.getUserId()));
        resp.setTargetType(a.getTargetType());
        resp.setTargetId(a.getTargetId());
        resp.setStatus(a.getStatus());
        resp.setCompletedAt(a.getCompletedAt());
        return resp;
    }

    private ChangeImpactResponse toImpactResponse(PmChangeImpact i) {
        ChangeImpactResponse resp = new ChangeImpactResponse();
        resp.setId(i.getId());
        resp.setImpactedType(i.getImpactedType());
        resp.setImpactedId(i.getImpactedId());
        resp.setImpactedTitle(i.getImpactedTitle());
        resp.setImpactLevel(i.getImpactLevel());
        return resp;
    }

    private String getUserName(String userId) {
        if (userId == null) return userId;
        return profileRepository.findByUserId(userId)
                .map(LocalizationHelper::getFullName)
                .orElse(userId);
    }
}