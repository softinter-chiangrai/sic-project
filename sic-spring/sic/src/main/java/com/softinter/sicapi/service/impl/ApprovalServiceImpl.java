// ============================================================
// 7. ApprovalServiceImpl.java (ทั้งหมด)
// ============================================================
package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.ApprovalSearchRequest;
import com.softinter.sicapi.dto.request.ApprovalSubmitRequest;
import com.softinter.sicapi.dto.response.ApprovalLogResponse;
import com.softinter.sicapi.dto.response.ApprovalResponse;
import com.softinter.sicapi.dto.response.ApprovalStepResponse;
import com.softinter.sicapi.dto.response.ApprovalSummaryResponse;
import com.softinter.sicapi.dto.response.CancelApprovalResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.entity.enums.ApprovalMode;
import com.softinter.sicapi.entity.enums.ApprovalStatus;
import com.softinter.sicapi.entity.enums.MaTicketStatus;
import com.softinter.sicapi.entity.pm.PmApproval;
import com.softinter.sicapi.entity.pm.PmApprovalFlow;
import com.softinter.sicapi.entity.pm.PmApprovalFlowStep;
import com.softinter.sicapi.entity.pm.PmApprovalLog;
import com.softinter.sicapi.entity.pm.PmApprovalStepStatus;
import com.softinter.sicapi.entity.pm.PmChangeRequest;
import com.softinter.sicapi.entity.pm.PmCrAssignee;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.exception.ResourceNotFoundException;
import com.softinter.sicapi.repository.pm.PmApprovalFlowRepository;
import com.softinter.sicapi.repository.pm.PmApprovalFlowStepRepository;
import com.softinter.sicapi.repository.pm.PmApprovalLogRepository;
import com.softinter.sicapi.repository.pm.PmApprovalRepository;
import com.softinter.sicapi.repository.pm.PmApprovalStepStatusRepository;
import com.softinter.sicapi.repository.pm.PmChangeRequestRepository;
import com.softinter.sicapi.repository.pm.PmCrAssigneeRepository;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmDeliveryRepository;
import com.softinter.sicapi.repository.pm.PmDesignReviewRepository;
import com.softinter.sicapi.repository.pm.PmDiagramTabRepository;
import com.softinter.sicapi.repository.pm.PmInvoiceRepository;
import com.softinter.sicapi.repository.pm.PmMaTicketRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationRepository;
import com.softinter.sicapi.repository.pm.PmUserManualRepository;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRoleRepository;
import com.softinter.sicapi.service.ApprovalFlowService;
import com.softinter.sicapi.service.ApprovalNotificationService;
import com.softinter.sicapi.service.ApprovalService;
import com.softinter.sicapi.dto.request.DocumentVersionRequest;
import com.softinter.sicapi.service.AuditLogService;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.DocumentVersionService;
import com.softinter.sicapi.util.LocalizationHelper;
import com.softinter.sicapi.util.PaginationUtil;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApprovalServiceImpl implements ApprovalService {

    private final PmApprovalRepository approvalRepository;
    private final PmApprovalFlowRepository flowRepository;
    private final PmApprovalFlowStepRepository stepRepository;
    private final PmApprovalStepStatusRepository stepStatusRepository;
    private final PmApprovalLogRepository logRepository;
    private final SuUserBusinessRoleRepository userBusinessRoleRepository;
    private final SuProfileRepository profileRepository;
    private final CurrentUserService currentUserService;
    private final ApprovalNotificationService notificationService;
    private final PmChangeRequestRepository changeRequestRepository;
    private final PmCrAssigneeRepository pmCrAssigneeRepository;
    private final PmRequirementRepository requirementRepository;
    private final PmSpecificationRepository specificationRepository;
    private final PmDesignReviewRepository designReviewRepository;
    private final PmDiagramTabRepository diagramTabRepository;
    private final PmCustomerContractRepository customerContractRepository;
    private final PmCustomerProjectRepository customerProjectRepository;
    private final PmDeliveryRepository deliveryRepository;
    private final PmInvoiceRepository invoiceRepository;
    private final PmMaTicketRepository maTicketRepository;
    private final PmUserManualRepository userManualRepository;
    private final DocumentVersionService versionService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public ApprovalResponse submitForApproval(ApprovalSubmitRequest request) {
        String userId = currentUserService.getUserId();
        String userName = currentUserService.getUsername();

        validateDocument(request.getDocumentType(), request.getDocumentId());

        boolean hasPending = approvalRepository.existsByDocumentTypeAndDocumentIdAndStatusAndIsActiveTrue(
                request.getDocumentType(), request.getDocumentId(), ApprovalStatus.PENDING);
        if (hasPending) {
            throw new IllegalStateException("This document already has a pending approval.");
        }

        PmApprovalFlow flow;
        if (request.getFlowId() != null) {
            flow = flowRepository.findById(request.getFlowId())
                    .orElseThrow(() -> new ResourceNotFoundException("Approval flow not found"));
        } else {
            flow = flowRepository.findByDocumentTypeAndIsActiveTrue(request.getDocumentType())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "No approval flow defined for " + request.getDocumentType()));
        }

        List<PmApprovalFlowStep> steps = stepRepository.findByFlowIdAndIsDeleteFalseOrderByStepOrderAsc(flow.getId());

        if (steps.isEmpty()) {
            throw new IllegalStateException("Approval flow has no steps defined.");
        }

        PmApproval approval = new PmApproval();
        approval.setBusinessId(currentUserService.getBusinessId());
        approval.setDocumentType(request.getDocumentType());
        approval.setDocumentId(request.getDocumentId());
        approval.setDocumentCode(request.getDocumentCode());
        approval.setDocumentTitle(request.getDocumentTitle());
        approval.setVersion(request.getVersion());
        approval.setRequestedBy(userId);
        approval.setRequestedByName(userName);
        approval.setRequestedDate(Instant.now());
        approval.setFlow(flow);
        approval.setStatus(ApprovalStatus.PENDING);
        approval.setComment(request.getComment());
        approval.setIsActive(true);

        List<PmApprovalStepStatus> stepStatuses = new ArrayList<>();
        for (PmApprovalFlowStep step : steps) {
            List<String> targetUserIds = new ArrayList<>();
            String approverUserIds = step.getApproverUserId();
            if (approverUserIds != null && !approverUserIds.isBlank()) {
                for (String uid : approverUserIds.split(",")) {
                    uid = uid.trim();
                    if (!uid.isEmpty()) {
                        targetUserIds.add(uid);
                    }
                }
            } else if (step.getApproverRole() != null && !step.getApproverRole().isBlank()) {
                List<String> roleUserIds = userBusinessRoleRepository
                        .findUserIdsByBusinessIdAndRoleCode(approval.getBusinessId(), step.getApproverRole());
                if (roleUserIds != null) {
                    targetUserIds.addAll(roleUserIds);
                }
            }

            if (targetUserIds.isEmpty()) {
                PmApprovalStepStatus stepStatus = new PmApprovalStepStatus();
                stepStatus.setApproval(approval);
                stepStatus.setStep(step);
                stepStatus.setStatus(ApprovalStatus.PENDING);
                stepStatus.setIsCompleted(false);

                if (Boolean.FALSE.equals(step.getIsRequired()) && flow.getApprovalMode() == ApprovalMode.CHAIN) {
                    stepStatus.setStatus(ApprovalStatus.APPROVED);
                    stepStatus.setIsCompleted(true);
                }
                stepStatuses.add(stepStatus);
            } else {
                for (String uid : targetUserIds) {
                    PmApprovalStepStatus stepStatus = new PmApprovalStepStatus();
                    stepStatus.setApproval(approval);
                    stepStatus.setStep(step);
                    stepStatus.setStatus(ApprovalStatus.PENDING);
                    stepStatus.setIsCompleted(false);
                    stepStatus.setApprover(uid);
                    stepStatus.setApproverName(getUserName(uid));

                    if (Boolean.FALSE.equals(step.getIsRequired()) && flow.getApprovalMode() == ApprovalMode.CHAIN) {
                        stepStatus.setStatus(ApprovalStatus.APPROVED);
                        stepStatus.setIsCompleted(true);
                    }
                    stepStatuses.add(stepStatus);
                }
            }
        }

        approval.setStepStatuses(stepStatuses);

        PmApprovalFlowStep currentStep = null;
        for (PmApprovalStepStatus stepStatus : stepStatuses) {
            if (stepStatus.getStatus() == ApprovalStatus.PENDING) {
                currentStep = stepStatus.getStep();
                break;
            }
        }

        if (currentStep == null) {
            approval.setStatus(ApprovalStatus.APPROVED);
            approval.setFinalApprover("system");
            approval.setFinalApprovalDate(Instant.now());
        } else {
            approval.setCurrentStep(currentStep);
        }

        approval = approvalRepository.save(approval);

        createLog(approval, null, "SUBMIT", userId, userName, "Submitted for approval", null, ApprovalStatus.PENDING);

        updateDocumentStatusOnSubmit(approval);

        notificationService.notifySubmitted(approval);

        // Audit Log
        try {
            auditLogService.log(
                    "SUBMIT_FOR_APPROVAL",
                    "Approval Center / " + request.getDocumentType(),
                    "ส่งเอกสาร " + (request.getDocumentCode() != null ? request.getDocumentCode() : request.getDocumentType()) + " เพื่อขออนุมัติ",
                    request.getDocumentType(),
                    request.getDocumentId(),
                    null, null, "Success", "Requested by: " + userName);
        } catch (Exception e) {
            log.error("Error creating audit log on submit: {}", e.getMessage(), e);
        }

        return toResponse(approval);
    }

    @Override
    @Transactional(readOnly = true)
    public ApprovalResponse getApproval(UUID id) {
        PmApproval approval = approvalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found"));
        return toResponse(approval);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ApprovalResponse> getApprovalsByDocument(String documentType, UUID documentId,
            Pageable pageable) {
        Page<PmApproval> pageResult = approvalRepository.findPagedByDocument(documentType, documentId, pageable);
        List<ApprovalResponse> data = pageResult.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return PaginationUtil.of(data, pageable.getPageNumber(), pageable.getPageSize(), pageResult.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ApprovalResponse> getPendingApprovals(String userId, Pageable pageable) {
        Page<PmApproval> pageResult = approvalRepository.findPendingByApprover(userId, pageable);
        List<ApprovalResponse> data = pageResult.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return PaginationUtil.of(data, pageable.getPageNumber(), pageable.getPageSize(), pageResult.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ApprovalResponse> getApprovedHistory(String userId, Pageable pageable) {
        Page<PmApproval> pageResult = approvalRepository.findApprovedHistoryByApprover(userId, pageable);
        List<ApprovalResponse> data = pageResult.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return PaginationUtil.of(data, pageable.getPageNumber(), pageable.getPageSize(), pageResult.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ApprovalResponse> getMyRequests(String userId, Pageable pageable) {
        Page<PmApproval> pageResult = approvalRepository
                .findByRequestedByAndIsActiveTrueOrderByRequestedDateDesc(userId, pageable);
        List<ApprovalResponse> data = pageResult.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return PaginationUtil.of(data, pageable.getPageNumber(), pageable.getPageSize(), pageResult.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ApprovalResponse> searchApprovals(ApprovalSearchRequest request) {
        Pageable pageable = PageRequest.of(
                request.getPageNumber() - 1,
                request.getPageSize(),
                Sort.by("createdDate").descending());

        Specification<PmApproval> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("isActive")));

            if (request.getDocumentType() != null && !request.getDocumentType().isBlank()) {
                predicates.add(cb.equal(root.get("documentType"), request.getDocumentType()));
            }

            if (request.getStatus() != null && !request.getStatus().isBlank()) {
                predicates.add(cb.equal(root.get("status"), ApprovalStatus.valueOf(request.getStatus())));
            }

            if (request.getRequestedBy() != null && !request.getRequestedBy().isBlank()) {
                predicates.add(cb.equal(root.get("requestedBy"), request.getRequestedBy()));
            }

            if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
                String keyword = "%" + request.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("documentCode")), keyword),
                        cb.like(cb.lower(root.get("documentTitle")), keyword)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PmApproval> pageResult = approvalRepository.findAll(spec, pageable);
        List<ApprovalResponse> data = pageResult.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PaginationUtil.of(data, request.getPageNumber() - 1, request.getPageSize(),
                pageResult.getTotalElements());
    }

    @Override
    @Transactional
    public ApprovalResponse approve(UUID approvalId, String comment, String signature) {
        String userId = currentUserService.getUserId();
        String userName = currentUserService.getUsername();

        PmApproval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found"));

        if (!canApprove(approvalId, userId)) {
            throw new IllegalStateException("You don't have permission to approve this document.");
        }

        if (approval.getStatus().isFinal()) {
            throw new IllegalStateException("This approval is already " + approval.getStatus());
        }

        PmApprovalStepStatus pendingStep = approval.getStepStatuses().stream()
                .filter(ss -> ss.getStatus() == ApprovalStatus.PENDING && !ss.getIsCompleted())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No pending step found for this approval"));

        if (!userId.equals(pendingStep.getApprover())) {
            throw new IllegalStateException("You are not assigned to the current step.");
        }

        pendingStep.setStatus(ApprovalStatus.APPROVED);
        pendingStep.setIsCompleted(true);
        pendingStep.setApprovalDate(Instant.now());
        pendingStep.setComment(comment);
        pendingStep.setSignatureUrl(signature);
        pendingStep.setApprover(userId);
        pendingStep.setApproverName(userName);
        stepStatusRepository.save(pendingStep);

        String stepName = pendingStep.getStep().getStepName();
        createLog(approval, pendingStep, "APPROVE", userId, userName, comment, ApprovalStatus.PENDING,
                ApprovalStatus.APPROVED);

        boolean allDone = approval.getStepStatuses().stream()
                .allMatch(ss -> Boolean.TRUE.equals(ss.getIsCompleted()));

        if (allDone) {
            approval.setStatus(ApprovalStatus.APPROVED);
            approval.setFinalApprover(userId);
            approval.setFinalApprovalDate(Instant.now());
            approval.setCurrentStep(null);
            approvalRepository.save(approval);

            updateDocumentStatusOnApprove(approval);
            notificationService.notifyApproved(approval, stepName);
        } else {
            PmApprovalStepStatus nextPending = approval.getStepStatuses().stream()
                    .filter(ss -> ss.getStatus() == ApprovalStatus.PENDING && !ss.getIsCompleted())
                    .findFirst()
                    .orElse(null);

            if (nextPending != null) {
                approval.setCurrentStep(nextPending.getStep());
                approvalRepository.save(approval);
                notificationService.notifySubmitted(approval);
            } else {
                approval.setStatus(ApprovalStatus.APPROVED);
                approval.setFinalApprover(userId);
                approval.setFinalApprovalDate(Instant.now());
                approval.setCurrentStep(null);
                approvalRepository.save(approval);
                updateDocumentStatusOnApprove(approval);
                notificationService.notifyApproved(approval, stepName);
            }
        }

        return toResponse(approval);
    }

    @Override
    @Transactional
    public ApprovalResponse reject(UUID approvalId, String comment) {
        String userId = currentUserService.getUserId();
        String userName = currentUserService.getUsername();

        PmApproval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found"));

        if (!canApprove(approvalId, userId)) {
            throw new IllegalStateException("You don't have permission to reject this document.");
        }

        if (approval.getStatus().isFinal()) {
            throw new IllegalStateException("This approval is already " + approval.getStatus());
        }

        PmApprovalStepStatus pendingStep = approval.getStepStatuses().stream()
                .filter(ss -> ss.getStatus() == ApprovalStatus.PENDING && !ss.getIsCompleted())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No pending step found for this approval"));

        pendingStep.setStatus(ApprovalStatus.REJECTED);
        pendingStep.setIsCompleted(true);
        pendingStep.setApprovalDate(Instant.now());
        pendingStep.setComment(comment);
        pendingStep.setApprover(userId);
        pendingStep.setApproverName(userName);
        stepStatusRepository.save(pendingStep);

        approval.setStatus(ApprovalStatus.REJECTED);
        approval.setFinalApprover(userId);
        approval.setFinalApprovalDate(Instant.now());
        approval.setCurrentStep(null);
        approval.setComment(comment);
        approvalRepository.save(approval);

        createLog(approval, pendingStep, "REJECT", userId, userName, comment, ApprovalStatus.PENDING,
                ApprovalStatus.REJECTED);

        updateDocumentStatusOnReject(approval);
        notificationService.notifyRejected(approval, pendingStep.getStep().getStepName());

        // Audit Log
        try {
            auditLogService.log(
                    "REJECT",
                    "Approval Center / " + approval.getDocumentType(),
                    "ปฏิเสธเอกสาร " + (approval.getDocumentCode() != null ? approval.getDocumentCode() : approval.getDocumentType()),
                    approval.getDocumentType(),
                    approval.getDocumentId(),
                    null, null, "Success", "Rejected by: " + userName + (comment != null ? " | หมายเหตุ: " + comment : ""));
        } catch (Exception e) {
            log.error("Error creating audit log on reject: {}", e.getMessage(), e);
        }

        return toResponse(approval);
    }

    @Override
    @Transactional
    public ApprovalResponse requestRevision(UUID approvalId, String comment) {
        String userId = currentUserService.getUserId();
        String userName = currentUserService.getUsername();

        PmApproval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found"));

        if (!canApprove(approvalId, userId)) {
            throw new IllegalStateException("You don't have permission to request revision.");
        }

        if (approval.getStatus().isFinal()) {
            throw new IllegalStateException("This approval is already " + approval.getStatus());
        }

        PmApprovalStepStatus pendingStep = approval.getStepStatuses().stream()
                .filter(ss -> ss.getStatus() == ApprovalStatus.PENDING && !ss.getIsCompleted())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No pending step found for this approval"));

        pendingStep.setStatus(ApprovalStatus.NEED_REVISION);
        pendingStep.setIsCompleted(true);
        pendingStep.setApprovalDate(Instant.now());
        pendingStep.setComment(comment);
        pendingStep.setApprover(userId);
        pendingStep.setApproverName(userName);
        stepStatusRepository.save(pendingStep);

        approval.setStatus(ApprovalStatus.NEED_REVISION);
        approval.setCurrentStep(null);
        approval.setComment(comment);
        approvalRepository.save(approval);

        createLog(approval, pendingStep, "REVISE", userId, userName, comment, ApprovalStatus.PENDING,
                ApprovalStatus.NEED_REVISION);

        notificationService.notifyRevisionRequested(approval);

        // Audit Log
        try {
            auditLogService.log(
                    "REQUEST_REVISION",
                    "Approval Center / " + approval.getDocumentType(),
                    "ส่งคืนให้แก้ไขเอกสาร " + (approval.getDocumentCode() != null ? approval.getDocumentCode() : approval.getDocumentType()),
                    approval.getDocumentType(),
                    approval.getDocumentId(),
                    null, null, "Success", "Revision requested by: " + userName + (comment != null ? " | หมายเหตุ: " + comment : ""));
        } catch (Exception e) {
            log.error("Error creating audit log on request revision: {}", e.getMessage(), e);
        }

        return toResponse(approval);
    }

    @Override
    @Transactional
    public ApprovalResponse cancel(UUID approvalId, String reason) {
        String userId = currentUserService.getUserId();
        String userName = currentUserService.getUsername();

        PmApproval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found"));

        if (!userId.equals(approval.getRequestedBy()) && !canApprove(approvalId, userId)) {
            throw new IllegalStateException("Only requester or approver can cancel this approval.");
        }

        if (approval.getStatus().isFinal()) {
            throw new IllegalStateException("This approval is already " + approval.getStatus());
        }

        approval.setStatus(ApprovalStatus.CANCELLED);
        approval.setCurrentStep(null);
        approval.setIsActive(false);
        approval.setComment(reason);
        approvalRepository.save(approval);

        createLog(approval, null, "CANCEL", userId, userName, reason, null, ApprovalStatus.CANCELLED);

        updateDocumentStatusOnCancel(approval);

        // Audit Log
        try {
            auditLogService.log(
                    "CANCEL_APPROVAL",
                    "Approval Center / " + approval.getDocumentType(),
                    "ยกเลิกการขออนุมัติเอกสาร " + (approval.getDocumentCode() != null ? approval.getDocumentCode() : approval.getDocumentType()),
                    approval.getDocumentType(),
                    approval.getDocumentId(),
                    null, null, "Success", "Cancelled by: " + userName + (reason != null ? " | เหตุผล: " + reason : ""));
        } catch (Exception e) {
            log.error("Error creating audit log on cancel: {}", e.getMessage(), e);
        }

        return toResponse(approval);
    }

    @Override
    @Transactional
    public CancelApprovalResponse cancelByFlow(UUID flowId, String reason) {
        String userId = currentUserService.getUserId();
        String userName = currentUserService.getUsername();

        List<PmApproval> activeApprovals = approvalRepository.findByFlowIdAndStatusIn(
                flowId,
                List.of(ApprovalStatus.PENDING, ApprovalStatus.PARTIALLY_APPROVED, ApprovalStatus.NEED_REVISION));

        if (activeApprovals.isEmpty()) {
            CancelApprovalResponse emptyResponse = new CancelApprovalResponse();
            emptyResponse.setCancelledCount(0);
            emptyResponse.setCancelledApprovals(new ArrayList<>());
            emptyResponse.setMessage("No active approvals found for this flow.");
            return emptyResponse;
        }

        List<ApprovalResponse> cancelledResponses = new ArrayList<>();

        for (PmApproval approval : activeApprovals) {
            approval.setStatus(ApprovalStatus.CANCELLED);
            approval.setCurrentStep(null);
            approval.setIsActive(false);
            approval.setComment(reason != null ? reason : "Cancelled due to flow modification");
            approvalRepository.save(approval);

            createLog(approval, null, "CANCEL_BY_FLOW", userId, userName,
                    reason != null ? reason : "Cancelled due to flow modification", null, ApprovalStatus.CANCELLED);

            updateDocumentStatusOnCancel(approval);

            cancelledResponses.add(toResponse(approval));
        }

        CancelApprovalResponse response = new CancelApprovalResponse();
        response.setCancelledCount(cancelledResponses.size());
        response.setCancelledApprovals(cancelledResponses);
        response.setMessage("Successfully cancelled " + cancelledResponses.size() + " approval(s).");
        return response;
    }

    @Override
    @Transactional
    public boolean invalidatePendingApproval(String documentType, UUID documentId, String reason) {
        return approvalRepository.findByDocumentAndStatus(documentType, documentId, ApprovalStatus.PENDING)
                .map(approval -> {
                    approval.setStatus(ApprovalStatus.CANCELLED);
                    approval.setCurrentStep(null);
                    approval.setIsActive(false);
                    approval.setComment(reason);
                    approvalRepository.save(approval);

                    createLog(approval, null, "AUTO_CANCEL", "system", "System",
                            reason, ApprovalStatus.PENDING, ApprovalStatus.CANCELLED);

                    try {
                        auditLogService.log(
                                "AUTO_CANCEL_APPROVAL",
                                "Approval Center / " + documentType,
                                "ยกเลิกคำขออนุมัติอัตโนมัติ เนื่องจากเอกสารถูกแก้ไขระหว่างรอการอนุมัติ",
                                documentType, documentId, null, null, "Success", reason);
                    } catch (Exception e) {
                        log.error("Error creating audit log on auto-cancel approval: {}", e.getMessage(), e);
                    }

                    return true;
                })
                .orElse(false);
    }

    @Override
    @Transactional
    public ApprovalResponse delegate(UUID approvalId, String delegateToUserId, String comment) {
        String userId = currentUserService.getUserId();
        String userName = currentUserService.getUsername();

        PmApproval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found"));

        if (!canApprove(approvalId, userId)) {
            throw new IllegalStateException("You don't have permission to delegate this approval.");
        }

        if (approval.getStatus().isFinal()) {
            throw new IllegalStateException("This approval is already " + approval.getStatus());
        }

        PmApprovalStepStatus pendingStep = approval.getStepStatuses().stream()
                .filter(ss -> ss.getStatus() == ApprovalStatus.PENDING && !ss.getIsCompleted())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No pending step found for this approval"));

        pendingStep.setApprover(delegateToUserId);
        pendingStep.setApproverName(getUserName(delegateToUserId));
        stepStatusRepository.save(pendingStep);

        createLog(approval, pendingStep, "DELEGATE", userId, userName,
                comment != null ? comment : "Delegated to " + getUserName(delegateToUserId),
                ApprovalStatus.PENDING, ApprovalStatus.PENDING);

        notificationService.notifyDelegate(approval, delegateToUserId);

        return toResponse(approval);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canApprove(UUID approvalId, String userId) {
        PmApproval approval = approvalRepository.findById(approvalId)
                .orElse(null);

        if (approval == null || !approval.getIsActive()) {
            return false;
        }

        if (approval.getStatus().isFinal()) {
            return false;
        }

        return approval.getStepStatuses().stream()
                .anyMatch(ss -> ss.getStatus() == ApprovalStatus.PENDING &&
                        !ss.getIsCompleted() &&
                        userId.equals(ss.getApprover()));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isApproved(String documentType, UUID documentId) {
        List<PmApproval> approvals = approvalRepository.findActiveByDocument(documentType, documentId);
        return approvals.stream()
                .anyMatch(a -> a.getStatus() == ApprovalStatus.APPROVED);
    }

    @Override
    @Transactional(readOnly = true)
    public ApprovalStatus getCurrentStatus(String documentType, UUID documentId) {
        List<PmApproval> approvals = approvalRepository.findActiveByDocument(documentType, documentId);
        return approvals.stream()
                .findFirst()
                .map(PmApproval::getStatus)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public ApprovalSummaryResponse getSummary() {
        ApprovalSummaryResponse response = new ApprovalSummaryResponse();
        response.setTotalPending(approvalRepository.countByStatusAndIsActiveTrue(ApprovalStatus.PENDING));
        response.setTotalApproved(approvalRepository.countByStatusAndIsActiveTrue(ApprovalStatus.APPROVED));
        response.setTotalRejected(approvalRepository.countByStatusAndIsActiveTrue(ApprovalStatus.REJECTED));
        response.setTotalNeedRevision(approvalRepository.countByStatusAndIsActiveTrue(ApprovalStatus.NEED_REVISION));
        response.setTotalExpired(approvalRepository.countByStatusAndIsActiveTrue(ApprovalStatus.EXPIRED));

        response.setRequirementPending(approvalRepository.countPendingByDocumentType("REQUIREMENT"));
        response.setSpecificationPending(approvalRepository.countPendingByDocumentType("SPECIFICATION"));
        response.setDeliveryPending(approvalRepository.countPendingByDocumentType("DELIVERY"));
        response.setInvoicePending(approvalRepository.countPendingByDocumentType("INVOICE"));
        response.setChangeRequestPending(approvalRepository.countPendingByDocumentType("CHANGE_REQUEST"));

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public void validateDocument(String documentType, UUID documentId) {
        switch (documentType.toUpperCase()) {
            case "REQUIREMENT":
                requirementRepository.findById(documentId)
                        .orElseThrow(() -> new ResourceNotFoundException("Requirement not found: " + documentId));
                break;
            case "SPECIFICATION":
                specificationRepository.findById(documentId)
                        .orElseThrow(() -> new ResourceNotFoundException("Specification not found: " + documentId));
                break;
            case "CHANGE_REQUEST":
                changeRequestRepository.findById(documentId)
                        .orElseThrow(() -> new ResourceNotFoundException("Change Request not found: " + documentId));
                break;
            case "DESIGN_REVIEW":
                designReviewRepository.findById(documentId)
                        .orElseThrow(() -> new ResourceNotFoundException("Design Review not found: " + documentId));
                break;
            case "CONTRACT":
                customerContractRepository.findById(documentId)
                        .orElseThrow(() -> new ResourceNotFoundException("Contract not found: " + documentId));
                break;
            case "DIAGRAM":
            case "DFD":
            case "ER":
                diagramTabRepository.findById(documentId)
                        .orElseThrow(() -> new ResourceNotFoundException("Diagram not found: " + documentId));
                break;
            case "DELIVERY":
                deliveryRepository.findById(documentId)
                        .orElseThrow(() -> new ResourceNotFoundException("Delivery not found: " + documentId));
                break;
            case "INVOICE":
                invoiceRepository.findById(documentId)
                        .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + documentId));
                break;
            case "MA_TICKET":
                maTicketRepository.findById(documentId)
                        .orElseThrow(() -> new ResourceNotFoundException("MA Ticket not found: " + documentId));
                break;
            case "USER_MANUAL":
            case "MANUAL":
                userManualRepository.findById(documentId)
                        .orElseThrow(() -> new ResourceNotFoundException("User Manual not found: " + documentId));
                break;
            default:
                break;
        }
    }

    private void updateDocumentStatusOnSubmit(PmApproval approval) {
        String docType = approval.getDocumentType();
        UUID docId = approval.getDocumentId();

        switch (docType.toUpperCase()) {
            case "REQUIREMENT":
                requirementRepository.findById(docId).ifPresent(req -> {
                    req.setStatus("In Review");
                    requirementRepository.save(req);
                });
                break;
            case "SPECIFICATION":
                specificationRepository.findById(docId).ifPresent(spec -> {
                    spec.setStatus("Review");
                    specificationRepository.save(spec);
                });
                break;
            case "CHANGE_REQUEST":
                changeRequestRepository.findById(docId).ifPresent(cr -> {
                    cr.setStatus("SUBMITTED");
                    changeRequestRepository.save(cr);
                });
                break;
            case "DESIGN_REVIEW":
                designReviewRepository.findById(docId).ifPresent(dr -> {
                    dr.setStatus("In Progress");
                    designReviewRepository.save(dr);
                });
                break;
            case "CONTRACT":
                customerContractRepository.findById(docId).ifPresent(contract -> {
                    contract.setSignStatus("Sent");
                    customerContractRepository.save(contract);
                });
                break;
            case "DELIVERY":
                deliveryRepository.findById(docId).ifPresent(del -> {
                    del.setStatus("PREPARING");
                    deliveryRepository.save(del);
                });
                break;
            case "INVOICE":
                invoiceRepository.findById(docId).ifPresent(inv -> {
                    inv.setApprovalStatus("IN_REVIEW");
                    invoiceRepository.save(inv);
                });
                break;
            case "MA_TICKET":
                maTicketRepository.findById(docId).ifPresent(ticket -> {
                    ticket.setStatus(MaTicketStatus.IN_PROGRESS);
                    maTicketRepository.save(ticket);
                });
                break;
            case "USER_MANUAL":
            case "MANUAL":
                userManualRepository.findById(docId).ifPresent(man -> {
                    man.setStatus("REVIEW");
                    userManualRepository.save(man);
                });
                break;
            default:
                break;
        }
    }

    private void updateDocumentStatusOnApprove(PmApproval approval) {
        String docType = approval.getDocumentType();
        UUID docId = approval.getDocumentId();
        String currentVer = approval.getVersion();
        final String majorVersion = versionService.promoteToMajorVersion(currentVer);

        switch (docType.toUpperCase()) {
            case "REQUIREMENT":
                requirementRepository.findById(docId).ifPresent(req -> {
                    req.setStatus("Approved");
                    req.setVersion(majorVersion);
                    requirementRepository.save(req);
                });
                break;
            case "SPECIFICATION":
                specificationRepository.findById(docId).ifPresent(spec -> {
                    spec.setStatus("Approved");
                    spec.setVersion(majorVersion);
                    specificationRepository.save(spec);
                });
                break;
            case "CHANGE_REQUEST":
                changeRequestRepository.findById(docId).ifPresent(cr -> {
                    cr.setStatus("APPROVED");
                    cr.setApprovedBy(approval.getFinalApprover());
                    cr.setApprovedAt(Instant.now());
                    changeRequestRepository.save(cr);

                    // ปรับสถานะเอกสารเป้าหมาย (เช่น Requirement / Spec) ให้เป็น Changed ทันทีที่ CR ผ่านการอนุมัติ
                    if (cr.getTargetType() != null && cr.getTargetId() != null) {
                        if ("REQUIREMENT".equalsIgnoreCase(cr.getTargetType())) {
                            requirementRepository.findById(cr.getTargetId()).ifPresent(req -> {
                                req.setStatus("Changed");
                                requirementRepository.save(req);
                            });
                        } else if ("SPECIFICATION".equalsIgnoreCase(cr.getTargetType())) {
                            specificationRepository.findById(cr.getTargetId()).ifPresent(spec -> {
                                spec.setStatus("Changed");
                                specificationRepository.save(spec);
                            });
                        }
                    }
                });
                break;
            case "DESIGN_REVIEW":
                designReviewRepository.findById(docId).ifPresent(dr -> {
                    dr.setStatus("Resolved");
                    designReviewRepository.save(dr);
                });
                break;
            case "CONTRACT":
                customerContractRepository.findById(docId).ifPresent(contract -> {
                    contract.setSignStatus("Signed");
                    customerContractRepository.save(contract);
                });
                break;
            case "DELIVERY":
                deliveryRepository.findById(docId).ifPresent(del -> {
                    del.setStatus("CONFIRMED");
                    del.setPmApprovedBy(approval.getFinalApprover());
                    del.setPmApprovedDate(Instant.now());
                    deliveryRepository.save(del);
                });
                break;
            case "INVOICE":
                invoiceRepository.findById(docId).ifPresent(inv -> {
                    inv.setApprovalStatus("APPROVED");
                    invoiceRepository.save(inv);
                });
                break;
            case "MA_TICKET":
                maTicketRepository.findById(docId).ifPresent(ticket -> {
                    ticket.setStatus(MaTicketStatus.RESOLVED);
                    ticket.setResolvedDate(Instant.now());
                    maTicketRepository.save(ticket);
                });
                break;
            case "USER_MANUAL":
            case "MANUAL":
                userManualRepository.findById(docId).ifPresent(man -> {
                    man.setStatus("APPROVED");
                    man.setVersion(majorVersion);
                    userManualRepository.save(man);
                });
                break;
            default:
                break;
        }

        // Auto-complete any active Change Requests associated with this target document
        if (!"CHANGE_REQUEST".equalsIgnoreCase(docType)) {
            try {
                List<PmChangeRequest> activeCrs = changeRequestRepository.findActiveByTarget(docType, docId);
                for (PmChangeRequest cr : activeCrs) {
                    cr.setStatus("IMPLEMENTED");
                    cr.setImplementedAt(Instant.now());
                    changeRequestRepository.save(cr);

                    List<PmCrAssignee> assignees = pmCrAssigneeRepository.findByChangeRequestIdAndIsDeleteFalse(cr.getId());
                    for (PmCrAssignee a : assignees) {
                        if (!"COMPLETED".equalsIgnoreCase(a.getStatus())) {
                            a.setStatus("COMPLETED");
                            a.setCompletedAt(Instant.now());
                            pmCrAssigneeRepository.save(a);
                        }
                    }
                    log.info("Auto-implemented Change Request {} upon approval of target document {} - {}", cr.getId(), docType, docId);
                }
            } catch (Exception e) {
                log.error("Error auto-completing Change Requests on document approval: {}", e.getMessage(), e);
            }
        }

        // Auto Create Document Version on Approval
        try {
            DocumentVersionRequest versionReq = new DocumentVersionRequest();
            versionReq.setDocumentType(docType);
            versionReq.setDocumentId(docId);
            versionReq.setDocumentCode(approval.getDocumentCode());
            versionReq.setVersionNo(majorVersion);
            versionReq.setChangeSummary("Automatic version generated upon approval");
            versionReq.setApprovalStatus("APPROVED");
            versionReq.setApprovedBy(approval.getFinalApprover());
            versionReq.setApprovedDate(Instant.now());
            versionReq.setIsActive(true);
            versionService.saveVersion(versionReq);
            log.info("Auto document version created for {} - {} with major version {}", docType, docId, majorVersion);
        } catch (Exception e) {
            log.error("Error generating auto version on approval: {}", e.getMessage(), e);
        }

        // Audit Log
        try {
            auditLogService.log(
                    "APPROVE",
                    "Approval Center / " + docType,
                    "อนุมัติเอกสาร " + (approval.getDocumentCode() != null ? approval.getDocumentCode() : docType)
                            + " เรียบร้อยแล้ว",
                    docType,
                    docId,
                    null,
                    null,
                    "Success",
                    "Final Approver: " + approval.getFinalApprover());
        } catch (Exception e) {
            log.error("Error creating audit log on approval: {}", e.getMessage(), e);
        }
    }

    private void updateDocumentStatusOnReject(PmApproval approval) {
        String docType = approval.getDocumentType();
        UUID docId = approval.getDocumentId();

        switch (docType.toUpperCase()) {
            case "REQUIREMENT":
                requirementRepository.findById(docId).ifPresent(req -> {
                    req.setStatus("Draft");
                    requirementRepository.save(req);
                });
                break;
            case "SPECIFICATION":
                specificationRepository.findById(docId).ifPresent(spec -> {
                    spec.setStatus("Draft");
                    specificationRepository.save(spec);
                });
                break;
            case "CHANGE_REQUEST":
                changeRequestRepository.findById(docId).ifPresent(cr -> {
                    cr.setStatus("REJECTED");
                    changeRequestRepository.save(cr);
                });
                break;
            case "DESIGN_REVIEW":
                designReviewRepository.findById(docId).ifPresent(dr -> {
                    dr.setStatus("Open");
                    designReviewRepository.save(dr);
                });
                break;
            case "CONTRACT":
                customerContractRepository.findById(docId).ifPresent(contract -> {
                    contract.setSignStatus("Draft");
                    customerContractRepository.save(contract);
                });
                break;
            case "DELIVERY":
                deliveryRepository.findById(docId).ifPresent(del -> {
                    del.setStatus("DRAFT");
                    deliveryRepository.save(del);
                });
                break;
            case "INVOICE":
                invoiceRepository.findById(docId).ifPresent(inv -> {
                    inv.setApprovalStatus("REJECTED");
                    invoiceRepository.save(inv);
                });
                break;
            case "MA_TICKET":
                maTicketRepository.findById(docId).ifPresent(ticket -> {
                    ticket.setStatus(MaTicketStatus.OPEN);
                    maTicketRepository.save(ticket);
                });
                break;
            case "USER_MANUAL":
            case "MANUAL":
                userManualRepository.findById(docId).ifPresent(man -> {
                    man.setStatus("DRAFT");
                    userManualRepository.save(man);
                });
                break;
            default:
                break;
        }
    }

    private void updateDocumentStatusOnCancel(PmApproval approval) {
        String docType = approval.getDocumentType();
        UUID docId = approval.getDocumentId();

        switch (docType.toUpperCase()) {
            case "REQUIREMENT":
                requirementRepository.findById(docId).ifPresent(req -> {
                    req.setStatus("Draft");
                    requirementRepository.save(req);
                });
                break;
            case "SPECIFICATION":
                specificationRepository.findById(docId).ifPresent(spec -> {
                    spec.setStatus("Draft");
                    specificationRepository.save(spec);
                });
                break;
            case "CHANGE_REQUEST":
                changeRequestRepository.findById(docId).ifPresent(cr -> {
                    cr.setStatus("DRAFT");
                    changeRequestRepository.save(cr);
                });
                break;
            case "DESIGN_REVIEW":
                designReviewRepository.findById(docId).ifPresent(dr -> {
                    dr.setStatus("Open");
                    designReviewRepository.save(dr);
                });
                break;
            case "CONTRACT":
                customerContractRepository.findById(docId).ifPresent(contract -> {
                    contract.setSignStatus("Draft");
                    customerContractRepository.save(contract);
                });
                break;
            case "DELIVERY":
                deliveryRepository.findById(docId).ifPresent(del -> {
                    del.setStatus("DRAFT");
                    deliveryRepository.save(del);
                });
                break;
            case "INVOICE":
                invoiceRepository.findById(docId).ifPresent(inv -> {
                    inv.setApprovalStatus("DRAFT");
                    invoiceRepository.save(inv);
                });
                break;
            case "MA_TICKET":
                maTicketRepository.findById(docId).ifPresent(ticket -> {
                    ticket.setStatus(MaTicketStatus.OPEN);
                    maTicketRepository.save(ticket);
                });
                break;
            case "USER_MANUAL":
            case "MANUAL":
                userManualRepository.findById(docId).ifPresent(man -> {
                    man.setStatus("DRAFT");
                    userManualRepository.save(man);
                });
                break;
            default:
                break;
        }
    }

    private void createLog(PmApproval approval, PmApprovalStepStatus stepStatus, String action,
            String actor, String actorName, String comment,
            ApprovalStatus oldStatus, ApprovalStatus newStatus) {
        PmApprovalLog log = new PmApprovalLog();
        log.setApproval(approval);
        log.setStepStatus(stepStatus);
        log.setAction(action);
        log.setActor(actor);
        log.setActorName(actorName);
        log.setComment(comment);
        log.setOldStatus(oldStatus);
        log.setNewStatus(newStatus);
        log.setCreatedBy(actor);
        log.setCreatedDate(Instant.now());
        logRepository.save(log);
    }

    private ApprovalResponse toResponse(PmApproval approval) {
        ApprovalResponse response = new ApprovalResponse();
        response.setId(approval.getId());
        response.setDocumentType(approval.getDocumentType());
        response.setDocumentId(approval.getDocumentId());
        response.setDocumentCode(approval.getDocumentCode());
        response.setDocumentTitle(approval.getDocumentTitle());
        response.setVersion(approval.getVersion());
        response.setRequestedBy(approval.getRequestedBy());
        response.setRequestedByName(approval.getRequestedByName());
        response.setRequestedDate(approval.getRequestedDate());
        response.setStatus(approval.getStatus());
        response.setStatusText(approval.getStatus().getThaiName());
        response.setComment(approval.getComment());

        // Resolve Project Info from target document
        resolveProjectInfo(approval.getDocumentType(), approval.getDocumentId(), response);

        if (approval.getFlow() != null) {
            response.setFlowCode(approval.getFlow().getFlowCode());
            response.setFlowName(approval.getFlow().getFlowName());
            response.setApprovalMode(approval.getFlow().getApprovalMode().name());
        }

        response.setFinalApprover(approval.getFinalApprover());
        response.setFinalApproverName(getUserName(approval.getFinalApprover()));
        response.setFinalApprovalDate(approval.getFinalApprovalDate());

        response.setCanApprove(canApprove(approval.getId(), currentUserService.getUserId()));
        response.setCanReject(canApprove(approval.getId(), currentUserService.getUserId()));
        response.setCanRevise(canApprove(approval.getId(), currentUserService.getUserId()));
        response.setCanCancel(currentUserService.getUserId().equals(approval.getRequestedBy()) ||
                canApprove(approval.getId(), currentUserService.getUserId()));

        List<ApprovalStepResponse> stepResponses = approval.getStepStatuses().stream()
                .map(this::toStepResponse)
                .collect(Collectors.toList());
        response.setSteps(stepResponses);

        PmApprovalStepStatus currentPending = approval.getStepStatuses().stream()
                .filter(ss -> ss.getStatus() == ApprovalStatus.PENDING && !ss.getIsCompleted())
                .findFirst()
                .orElse(null);

        if (currentPending != null) {
            response.setCurrentStep(toStepResponse(currentPending));
        }

        List<ApprovalLogResponse> logResponses = logRepository.findByApprovalIdOrderByCreatedDateAsc(approval.getId())
                .stream()
                .map(this::toLogResponse)
                .collect(Collectors.toList());
        response.setLogs(logResponses);

        return response;
    }

    private void resolveProjectInfo(String documentType, UUID documentId, ApprovalResponse response) {
        if (documentType == null || documentId == null) return;
        try {
            UUID projId = null;
            String projName = null;

            switch (documentType.toUpperCase()) {
                case "REQUIREMENT":
                    var reqOpt = requirementRepository.findById(documentId);
                    if (reqOpt.isPresent()) {
                        var req = reqOpt.get();
                        if (req.getProject() != null) {
                            projId = req.getProject().getId();
                            projName = req.getProject().getProjectName();
                        } else if (req.getProjectId() != null) {
                            projId = req.getProjectId();
                        }
                    }
                    break;
                case "SPECIFICATION":
                    var specOpt = specificationRepository.findById(documentId);
                    if (specOpt.isPresent()) {
                        var spec = specOpt.get();
                        if (spec.getProject() != null) {
                            projId = spec.getProject().getId();
                            projName = spec.getProject().getProjectName();
                        }
                    }
                    break;
                case "CHANGE_REQUEST":
                    var crOpt = changeRequestRepository.findById(documentId);
                    if (crOpt.isPresent()) {
                        var cr = crOpt.get();
                        projId = cr.getProjectId();
                        if (projId == null && cr.getTargetType() != null && cr.getTargetId() != null) {
                            if ("REQUIREMENT".equalsIgnoreCase(cr.getTargetType())) {
                                var targetReq = requirementRepository.findById(cr.getTargetId()).orElse(null);
                                if (targetReq != null) {
                                    projId = targetReq.getProject() != null ? targetReq.getProject().getId() : targetReq.getProjectId();
                                    if (targetReq.getProject() != null) projName = targetReq.getProject().getProjectName();
                                }
                            } else if ("SPECIFICATION".equalsIgnoreCase(cr.getTargetType())) {
                                var targetSpec = specificationRepository.findById(cr.getTargetId()).orElse(null);
                                if (targetSpec != null) {
                                    projId = targetSpec.getProject() != null ? targetSpec.getProject().getId() : null;
                                    if (targetSpec.getProject() != null) projName = targetSpec.getProject().getProjectName();
                                }
                            }
                        }
                    }
                    break;
                case "DESIGN_REVIEW":
                    var drOpt = designReviewRepository.findById(documentId);
                    if (drOpt.isPresent()) {
                        var dr = drOpt.get();
                        if (dr.getProject() != null) {
                            projId = dr.getProject().getId();
                            projName = dr.getProject().getProjectName();
                        }
                    }
                    break;
                case "DIAGRAM":
                case "DFD":
                case "ER":
                    var diagOpt = diagramTabRepository.findById(documentId);
                    if (diagOpt.isPresent()) {
                        projId = diagOpt.get().getProjectId();
                    }
                    break;
                case "DELIVERY":
                    var delOpt = deliveryRepository.findById(documentId);
                    if (delOpt.isPresent()) {
                        projId = delOpt.get().getProjectId();
                    }
                    break;
                case "INVOICE":
                    var invOpt = invoiceRepository.findById(documentId);
                    if (invOpt.isPresent()) {
                        projId = invOpt.get().getProjectId();
                    }
                    break;
                case "MA_TICKET":
                    var ticketOpt = maTicketRepository.findById(documentId);
                    if (ticketOpt.isPresent()) {
                        projId = ticketOpt.get().getProjectId();
                    }
                    break;
                case "USER_MANUAL":
                case "MANUAL":
                    var manualOpt = userManualRepository.findById(documentId);
                    if (manualOpt.isPresent()) {
                        projId = manualOpt.get().getProjectId();
                    }
                    break;
                default:
                    break;
            }

            if (projId != null) {
                response.setProjectId(projId);
                if (projName == null) {
                    projName = customerProjectRepository.findById(projId)
                            .map(p -> p.getProjectName())
                            .orElse(null);
                }
                response.setProjectName(projName);
            }
        } catch (Exception e) {
            log.warn("Failed to resolve project info for approval docType={}, docId={}", documentType, documentId, e);
        }
    }

    private ApprovalStepResponse toStepResponse(PmApprovalStepStatus stepStatus) {
        ApprovalStepResponse response = new ApprovalStepResponse();
        response.setId(stepStatus.getId());
        response.setStepId(stepStatus.getStep().getId());
        response.setStepOrder(stepStatus.getStep().getStepOrder());
        response.setStepName(stepStatus.getStep().getStepName());
        response.setApproverRole(stepStatus.getStep().getApproverRole());
        response.setApproverUserId(stepStatus.getStep().getApproverUserId());
        response.setApproverName(stepStatus.getApproverName());
        response.setStatus(stepStatus.getStatus());
        response.setStatusText(stepStatus.getStatus().getThaiName());
        response.setApprovalDate(stepStatus.getApprovalDate());
        response.setComment(stepStatus.getComment());
        response.setCurrent(stepStatus.getStatus() == ApprovalStatus.PENDING && !stepStatus.getIsCompleted());
        response.setComplete(stepStatus.getIsCompleted());
        response.setIsRequired(stepStatus.getStep().getIsRequired());
        response.setTimeoutDays(stepStatus.getStep().getTimeoutDays());
        response.setTimeoutAction(stepStatus.getStep().getTimeoutAction() != null ? stepStatus.getStep().getTimeoutAction() : "NONE");
        return response;
    }

    private ApprovalLogResponse toLogResponse(PmApprovalLog log) {
        ApprovalLogResponse response = new ApprovalLogResponse();
        response.setId(log.getId());
        response.setAction(log.getAction());
        response.setActor(log.getActor());
        response.setActorName(log.getActorName());
        response.setComment(log.getComment());
        response.setOldStatus(log.getOldStatus());
        response.setNewStatus(log.getNewStatus());
        response.setCreatedDate(log.getCreatedDate());
        return response;
    }

    @Override
    @Transactional
    public void processTimeouts() {
        List<PmApproval> pendingApprovals = approvalRepository.findAll((root, query, cb) -> 
            cb.and(
                cb.equal(root.get("status"), ApprovalStatus.PENDING),
                cb.isFalse(root.get("isDelete")),
                cb.isNotNull(root.get("currentStep"))
            )
        );

        Instant now = Instant.now();

        for (PmApproval approval : pendingApprovals) {
            PmApprovalFlowStep currentStep = approval.getCurrentStep();
            if (currentStep == null || currentStep.getTimeoutDays() == null || currentStep.getTimeoutDays() <= 0) {
                continue;
            }

            Instant baseTime = approval.getRequestedDate() != null ? approval.getRequestedDate() : approval.getCreatedDate();
            // Check last approval date if any previous step completed
            Instant lastActionDate = approval.getStepStatuses().stream()
                    .filter(ss -> Boolean.TRUE.equals(ss.getIsCompleted()) && ss.getApprovalDate() != null)
                    .map(PmApprovalStepStatus::getApprovalDate)
                    .max(Instant::compareTo)
                    .orElse(baseTime);

            long timeoutMillis = currentStep.getTimeoutDays().longValue() * 24L * 60L * 60L * 1000L;
            Instant dueDate = lastActionDate.plusMillis(timeoutMillis);

            if (now.isAfter(dueDate)) {
                String action = currentStep.getTimeoutAction() != null ? currentStep.getTimeoutAction() : "NONE";
                if ("NONE".equalsIgnoreCase(action) && Boolean.TRUE.equals(currentStep.getCanSkip())) {
                    action = "AUTO_SKIP";
                }

                if ("AUTO_SKIP".equalsIgnoreCase(action)) {
                    handleAutoSkip(approval, currentStep);
                } else if ("AUTO_APPROVE".equalsIgnoreCase(action)) {
                    handleAutoApprove(approval, currentStep);
                } else if ("AUTO_REJECT".equalsIgnoreCase(action)) {
                    handleAutoReject(approval, currentStep);
                }
            }
        }
    }

    private void handleAutoSkip(PmApproval approval, PmApprovalFlowStep currentStep) {
        List<PmApprovalStepStatus> pendingStatuses = approval.getStepStatuses().stream()
                .filter(ss -> ss.getStep().getId().equals(currentStep.getId()) && !Boolean.TRUE.equals(ss.getIsCompleted()))
                .collect(Collectors.toList());

        for (PmApprovalStepStatus stepStatus : pendingStatuses) {
            stepStatus.setStatus(ApprovalStatus.APPROVED);
            stepStatus.setIsCompleted(true);
            stepStatus.setApprovalDate(Instant.now());
            stepStatus.setComment("Skipped automatically due to timeout (" + currentStep.getTimeoutDays() + " days)");
            stepStatus.setApproverName("System (Auto-Skip)");
            stepStatusRepository.save(stepStatus);
            createLog(approval, stepStatus, "AUTO_SKIP", "system", "System", "Auto-skipped due to timeout", ApprovalStatus.PENDING, ApprovalStatus.APPROVED);
        }

        advanceToNextStepOrComplete(approval, currentStep.getStepName());
    }

    private void handleAutoApprove(PmApproval approval, PmApprovalFlowStep currentStep) {
        List<PmApprovalStepStatus> pendingStatuses = approval.getStepStatuses().stream()
                .filter(ss -> ss.getStep().getId().equals(currentStep.getId()) && !Boolean.TRUE.equals(ss.getIsCompleted()))
                .collect(Collectors.toList());

        for (PmApprovalStepStatus stepStatus : pendingStatuses) {
            stepStatus.setStatus(ApprovalStatus.APPROVED);
            stepStatus.setIsCompleted(true);
            stepStatus.setApprovalDate(Instant.now());
            stepStatus.setComment("Approved automatically due to timeout (" + currentStep.getTimeoutDays() + " days)");
            stepStatus.setApproverName("System (Auto-Approve)");
            stepStatusRepository.save(stepStatus);
            createLog(approval, stepStatus, "AUTO_APPROVE", "system", "System", "Auto-approved due to timeout", ApprovalStatus.PENDING, ApprovalStatus.APPROVED);
        }

        advanceToNextStepOrComplete(approval, currentStep.getStepName());
    }

    private void handleAutoReject(PmApproval approval, PmApprovalFlowStep currentStep) {
        List<PmApprovalStepStatus> pendingStatuses = approval.getStepStatuses().stream()
                .filter(ss -> ss.getStep().getId().equals(currentStep.getId()) && !Boolean.TRUE.equals(ss.getIsCompleted()))
                .collect(Collectors.toList());

        for (PmApprovalStepStatus stepStatus : pendingStatuses) {
            stepStatus.setStatus(ApprovalStatus.REJECTED);
            stepStatus.setIsCompleted(true);
            stepStatus.setApprovalDate(Instant.now());
            stepStatus.setComment("Rejected automatically due to timeout (" + currentStep.getTimeoutDays() + " days)");
            stepStatus.setApproverName("System (Auto-Reject)");
            stepStatusRepository.save(stepStatus);
        }

        approval.setStatus(ApprovalStatus.REJECTED);
        approval.setFinalApprover("system");
        approval.setFinalApprovalDate(Instant.now());
        approval.setCurrentStep(null);
        approval.setComment("Rejected automatically due to timeout (" + currentStep.getTimeoutDays() + " days)");
        approvalRepository.save(approval);

        createLog(approval, null, "AUTO_REJECT", "system", "System", "Auto-rejected due to timeout", ApprovalStatus.PENDING, ApprovalStatus.REJECTED);
        updateDocumentStatusOnReject(approval);
        notificationService.notifyRejected(approval, currentStep.getStepName());
    }

    private void advanceToNextStepOrComplete(PmApproval approval, String previousStepName) {
        boolean allDone = approval.getStepStatuses().stream()
                .allMatch(ss -> Boolean.TRUE.equals(ss.getIsCompleted()));

        if (allDone) {
            approval.setStatus(ApprovalStatus.APPROVED);
            approval.setFinalApprover("system");
            approval.setFinalApprovalDate(Instant.now());
            approval.setCurrentStep(null);
            approvalRepository.save(approval);

            updateDocumentStatusOnApprove(approval);
            notificationService.notifyApproved(approval, previousStepName);
        } else {
            PmApprovalStepStatus nextPending = approval.getStepStatuses().stream()
                    .filter(ss -> ss.getStatus() == ApprovalStatus.PENDING && !Boolean.TRUE.equals(ss.getIsCompleted()))
                    .findFirst()
                    .orElse(null);

            if (nextPending != null) {
                approval.setCurrentStep(nextPending.getStep());
                approvalRepository.save(approval);
                notificationService.notifySubmitted(approval);
            } else {
                approval.setStatus(ApprovalStatus.APPROVED);
                approval.setFinalApprover("system");
                approval.setFinalApprovalDate(Instant.now());
                approval.setCurrentStep(null);
                approvalRepository.save(approval);
                updateDocumentStatusOnApprove(approval);
                notificationService.notifyApproved(approval, previousStepName);
            }
        }
    }

    private String getUserName(String userId) {
        if (userId == null) {
            return null;
        }
        return profileRepository.findByUserId(userId)
                .map(LocalizationHelper::getFullName)
                .orElse(userId);
    }
}