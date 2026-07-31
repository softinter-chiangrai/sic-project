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
import com.softinter.sicapi.util.LocalizationHelper;
import com.softinter.sicapi.util.PaginationUtil;
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
    private final EditSessionService editSessionService;
    private final CurrentUserService currentUserService;
    private final PmCrAssigneeRepository pmCrAssigneeRepository;
    private final PmChangeImpactRepository pmChangeImpactRepository;
    private final ApprovalService approvalService;

    @Override
    @Transactional
    public ChangeRequestResponse createChangeRequest(ChangeRequestRequest request) {
        validateTargetExists(request.getTargetType(), request.getTargetId());

        // ตรวจสอบสถานะเอกสารเป้าหมาย ห้ามเป็น DRAFT
        String docStatus = getDocumentStatus(request.getTargetType(), request.getTargetId());
        if ("DRAFT".equalsIgnoreCase(docStatus)) {
            throw new IllegalStateException("Draft documents can be edited directly without a Change Request.");
        }

        List<PmChangeRequest> activeCRs = changeRequestRepository.findActiveByTarget(
                request.getTargetType(), request.getTargetId()
        );
        if (!activeCRs.isEmpty()) {
            throw new IllegalStateException("There is already an active Change Request for this document.");
        }

        PmChangeRequest cr = new PmChangeRequest();
        cr.setProjectId(request.getProjectId());
        cr.setTargetType(request.getTargetType());
        cr.setTargetId(request.getTargetId());
        cr.setTitle(request.getTitle());
        cr.setDescription(request.getDescription());
        cr.setChangeReason(request.getChangeReason());
        cr.setRequesterId(currentUserService.getUserId());
        cr.setStatus("DRAFT");
        cr.setTargetVersion(request.getTargetVersion());
        cr.setCreatedBy(currentUserService.getUserId());
        cr.setCreatedDate(Instant.now());

        cr = changeRequestRepository.save(cr);

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

        return toResponse(cr);
    }

    @Override
    @Transactional
    public ChangeRequestResponse updateChangeRequest(UUID id, ChangeRequestRequest request) {
        PmChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Change Request not found"));

        if (!"DRAFT".equals(cr.getStatus()) && !"SUBMITTED".equals(cr.getStatus())) {
            throw new IllegalStateException("Cannot update Change Request in status: " + cr.getStatus());
        }

        cr.setTitle(request.getTitle());
        cr.setDescription(request.getDescription());
        cr.setChangeReason(request.getChangeReason());
        cr.setTargetVersion(request.getTargetVersion());
        cr.setUpdatedBy(currentUserService.getUserId());
        cr.setUpdatedDate(Instant.now());

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
    public PaginationResponse<ChangeRequestResponse> listChangeRequests(String targetType, UUID targetId, String status, Pageable pageable) {
        Specification<PmChangeRequest> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDelete")));

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
        cr.setIsDelete(true);
        cr.setDeleteBy(currentUserService.getUserId());
        cr.setDeleteDate(Instant.now());
        changeRequestRepository.save(cr);
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
        com.softinter.sicapi.dto.request.ApprovalSubmitRequest submitReq = new com.softinter.sicapi.dto.request.ApprovalSubmitRequest();
        submitReq.setDocumentType("CHANGE_REQUEST");
        submitReq.setDocumentId(cr.getId());
        submitReq.setDocumentCode("CR-" + cr.getId().toString().substring(0, 8).toUpperCase());
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

        // สร้าง Edit Session ให้ Assignee
        List<PmCrAssignee> assignees = pmCrAssigneeRepository.findByChangeRequestIdAndIsDeleteFalse(cr.getId());
        for (PmCrAssignee assignee : assignees) {
            editSessionService.createEditSession(cr.getId(), assignee.getTargetType(), assignee.getTargetId(), assignee.getUserId());
        }

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

        // ปิด Edit Session สำหรับเอกสารเป้าหมายทั้งหมด และเปลี่ยนสถานะเอกสารเป็น CHANGED
        List<PmCrAssignee> assignees = pmCrAssigneeRepository.findByChangeRequestIdAndIsDeleteFalse(cr.getId());
        for (PmCrAssignee assignee : assignees) {
            editSessionService.closeEditSession(assignee.getTargetType(), assignee.getTargetId());
            updateDocumentStatus(assignee.getTargetType(), assignee.getTargetId(), "CHANGED");
        }

        // สำหรับ target หลักของ CR เอง
        editSessionService.closeEditSession(cr.getTargetType(), cr.getTargetId());
        updateDocumentStatus(cr.getTargetType(), cr.getTargetId(), "CHANGED");

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

        // ปิด Edit Session ของ Assignee คนนี้
        editSessionService.closeEditSession(assignee.getTargetType(), assignee.getTargetId());
        updateDocumentStatus(assignee.getTargetType(), assignee.getTargetId(), "CHANGED");

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

    private void updateDocumentStatus(String targetType, UUID targetId, String newStatus) {
        switch (targetType.toUpperCase()) {
            case "REQUIREMENT":
                requirementRepository.findById(targetId).ifPresent(r -> {
                    r.setStatus(newStatus);
                    requirementRepository.save(r);
                });
                break;
            case "SPECIFICATION":
                specificationRepository.findById(targetId).ifPresent(s -> {
                    s.setStatus(newStatus);
                    specificationRepository.save(s);
                });
                break;
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
        response.setProjectId(cr.getProjectId());
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
        response.setTargetVersion(cr.getTargetVersion());
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