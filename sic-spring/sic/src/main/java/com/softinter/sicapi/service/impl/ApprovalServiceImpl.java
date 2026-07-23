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
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.entity.enums.ApprovalMode;
import com.softinter.sicapi.entity.enums.ApprovalStatus;
import com.softinter.sicapi.entity.pm.PmApproval;
import com.softinter.sicapi.entity.pm.PmApprovalFlow;
import com.softinter.sicapi.entity.pm.PmApprovalFlowStep;
import com.softinter.sicapi.entity.pm.PmApprovalLog;
import com.softinter.sicapi.entity.pm.PmApprovalStepStatus;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.entity.pm.PmRequirementChangeRequest;
import com.softinter.sicapi.exception.ResourceNotFoundException;
import com.softinter.sicapi.repository.pm.PmApprovalFlowRepository;
import com.softinter.sicapi.repository.pm.PmApprovalFlowStepRepository;
import com.softinter.sicapi.repository.pm.PmApprovalLogRepository;
import com.softinter.sicapi.repository.pm.PmApprovalRepository;
import com.softinter.sicapi.repository.pm.PmApprovalStepStatusRepository;
import com.softinter.sicapi.repository.pm.PmRequirementChangeRequestRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRoleRepository;
import com.softinter.sicapi.service.ApprovalFlowService;
import com.softinter.sicapi.service.ApprovalNotificationService;
import com.softinter.sicapi.service.ApprovalService;
import com.softinter.sicapi.service.CurrentUserService;
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
    private final ApprovalFlowService flowService;
    private final ApprovalNotificationService notificationService;

    // ✅ Inject repositories สำหรับอัปเดตสถานะเอกสาร
    private final PmRequirementChangeRequestRepository changeRequestRepository;
    private final PmRequirementRepository requirementRepository;

    // ============================================================
    // 1. Submit for Approval (FIXED Optimistic Locking)
    // ============================================================
    @Override
    @Transactional
    public ApprovalResponse submitForApproval(ApprovalSubmitRequest request) {
        String userId = currentUserService.getUserId();
        String userName = currentUserService.getUsername();

        // 1. Validate document
        validateDocument(request.getDocumentType(), request.getDocumentId());

        // 2. Check if already has pending approval
        boolean hasPending = approvalRepository.existsByDocumentTypeAndDocumentIdAndStatusAndIsActiveTrue(
                request.getDocumentType(), request.getDocumentId(), ApprovalStatus.PENDING
        );
        if (hasPending) {
            throw new IllegalStateException("This document already has a pending approval.");
        }

        // 3. Get flow
        PmApprovalFlow flow;
        if (request.getFlowId() != null) {
            flow = flowRepository.findById(request.getFlowId())
                    .orElseThrow(() -> new ResourceNotFoundException("Approval flow not found"));
        } else {
            flow = flowRepository.findByDocumentTypeAndIsActiveTrue(request.getDocumentType())
                    .orElseThrow(() -> new ResourceNotFoundException("No approval flow defined for " + request.getDocumentType()));
        }

        // 4. Get steps
        List<PmApprovalFlowStep> steps = stepRepository.findByFlowIdOrderByStepOrderAsc(flow.getId());

        if (steps.isEmpty()) {
            throw new IllegalStateException("Approval flow has no steps defined.");
        }

        // 5. Create approval (not saved yet)
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

        if (request.getAttachmentId() != null) {
            // TODO: Load attachment
        }

        // 6. Create step statuses (not saved yet)
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
                List<String> roleUserIds = userBusinessRoleRepository.findUserIdsByBusinessIdAndRoleCode(approval.getBusinessId(), step.getApproverRole());
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

        // 7. Set the step statuses into approval
        approval.setStepStatuses(stepStatuses);

        // 8. Determine current step and update approval status if needed
        PmApprovalFlowStep currentStep = null;
        for (PmApprovalStepStatus stepStatus : stepStatuses) {
            if (stepStatus.getStatus() == ApprovalStatus.PENDING) {
                currentStep = stepStatus.getStep();
                break;
            }
        }

        if (currentStep == null) {
            // All steps are auto-approved (not required)
            approval.setStatus(ApprovalStatus.APPROVED);
            approval.setFinalApprover("system");
            approval.setFinalApprovalDate(Instant.now());
        } else {
            approval.setCurrentStep(currentStep);
        }

        // 9. Save everything in one shot (cascade will persist stepStatuses)
        approval = approvalRepository.save(approval);

        // 10. Log (after save)
        createLog(approval, null, "SUBMIT", userId, userName, "Submitted for approval", null, ApprovalStatus.PENDING);

        // 11. ✅ อัปเดตสถานะเอกสารเป็น "In Review" หรือ "Pending"
        updateDocumentStatusOnSubmit(approval);

        // 12. Notify
        notificationService.notifySubmitted(approval);

        return toResponse(approval);
    }

    // ============================================================
    // 2. Query (no changes)
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public ApprovalResponse getApproval(UUID id) {
        PmApproval approval = approvalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found"));
        return toResponse(approval);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ApprovalResponse> getApprovalsByDocument(String documentType, UUID documentId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
        Page<PmApproval> pageResult = approvalRepository.findPagedByDocument(documentType, documentId, pageable);
        List<ApprovalResponse> data = pageResult.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return PaginationUtil.of(data, page, size, pageResult.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ApprovalResponse> getPendingApprovals(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestedDate").ascending());
        Page<PmApproval> pageResult = approvalRepository.findPendingByApprover(userId, pageable);
        List<ApprovalResponse> data = pageResult.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return PaginationUtil.of(data, page, size, pageResult.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ApprovalResponse> getMyRequests(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestedDate").descending());
        Page<PmApproval> pageResult = approvalRepository.findByRequestedByAndIsActiveTrueOrderByRequestedDateDesc(userId, pageable);
        List<ApprovalResponse> data = pageResult.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return PaginationUtil.of(data, page, size, pageResult.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<ApprovalResponse> searchApprovals(ApprovalSearchRequest request) {
        Pageable pageable = PageRequest.of(
                request.getPageNumber() - 1,
                request.getPageSize(),
                Sort.by("createdDate").descending()
        );

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
                        cb.like(cb.lower(root.get("documentTitle")), keyword)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PmApproval> pageResult = approvalRepository.findAll(spec, pageable);
        List<ApprovalResponse> data = pageResult.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PaginationUtil.of(data, request.getPageNumber() - 1, request.getPageSize(), pageResult.getTotalElements());
    }

    // ============================================================
    // 3. Actions
    // ============================================================
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

        // Find current pending step for this approver
        PmApprovalStepStatus pendingStep = approval.getStepStatuses().stream()
                .filter(ss -> ss.getStatus() == ApprovalStatus.PENDING
                        && !ss.getIsCompleted()
                        && userId.equals(ss.getApprover()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No pending step found for you to approve."));

        // Update step
        pendingStep.setStatus(ApprovalStatus.APPROVED);
        pendingStep.setApprover(userId);
        pendingStep.setApproverName(userName);
        pendingStep.setApprovalDate(Instant.now());
        pendingStep.setComment(comment);
        pendingStep.setSignatureUrl(signature);
        pendingStep.setIsCompleted(true);
        stepStatusRepository.save(pendingStep);

        // Log
        createLog(approval, pendingStep, "APPROVE", userId, userName, comment,
                ApprovalStatus.PENDING, null);

        // Check if all steps are completed
        boolean allCompleted = approval.getStepStatuses().stream()
                .allMatch(ss -> ss.getIsCompleted() || ss.getStatus() == ApprovalStatus.SKIPPED);

        if (allCompleted) {
            // All done!
            approval.setStatus(ApprovalStatus.APPROVED);
            approval.setFinalApprover(userId);
            approval.setFinalApprovalDate(Instant.now());
            approval.setCurrentStep(null);
            approvalRepository.save(approval);

            createLog(approval, null, "APPROVE", userId, userName,
                    "All approvals completed. Document approved.",
                    ApprovalStatus.PARTIALLY_APPROVED, ApprovalStatus.APPROVED);

            notificationService.notifyApproved(approval, pendingStep.getStep().getStepName());

            // ✅ อัปเดตสถานะเอกสารเป็น Approved
            updateDocumentStatus(approval, "Approved");

        } else {
            // Move to next step (for CHAIN mode)
            PmApprovalFlow flow = approval.getFlow();
            if (flow.getApprovalMode() == ApprovalMode.CHAIN) {
                // Find next pending step
                PmApprovalStepStatus nextStep = approval.getStepStatuses().stream()
                        .filter(ss -> ss.getStatus() == ApprovalStatus.PENDING && !ss.getIsCompleted())
                        .findFirst()
                        .orElse(null);

                if (nextStep != null) {
                    approval.setCurrentStep(nextStep.getStep());
                    approvalRepository.save(approval);
                    notificationService.notifyPendingReminder(approval);
                }
            } else if (flow.getApprovalMode() == ApprovalMode.PARALLEL) {
                // Check if partially approved
                long completedCount = approval.getStepStatuses().stream()
                        .filter(ss -> ss.getIsCompleted() && ss.getStatus() == ApprovalStatus.APPROVED)
                        .count();

                if (completedCount > 0 && completedCount < approval.getStepStatuses().size()) {
                    approval.setStatus(ApprovalStatus.PARTIALLY_APPROVED);
                    approvalRepository.save(approval);
                }
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

        // Find current pending step for this approver
        PmApprovalStepStatus pendingStep = approval.getStepStatuses().stream()
                .filter(ss -> ss.getStatus() == ApprovalStatus.PENDING && !ss.getIsCompleted())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No pending step found."));

        // Update step
        pendingStep.setStatus(ApprovalStatus.REJECTED);
        pendingStep.setApprover(userId);
        pendingStep.setApproverName(userName);
        pendingStep.setApprovalDate(Instant.now());
        pendingStep.setComment(comment);
        pendingStep.setIsCompleted(true);
        stepStatusRepository.save(pendingStep);

        // Update approval
        approval.setStatus(ApprovalStatus.REJECTED);
        approval.setCurrentStep(null);
        approvalRepository.save(approval);

        // Log
        createLog(approval, pendingStep, "REJECT", userId, userName, comment,
                ApprovalStatus.PENDING, ApprovalStatus.REJECTED);

        notificationService.notifyRejected(approval, pendingStep.getStep().getStepName());

        // ✅ อัปเดตสถานะเอกสารเป็น Rejected
        updateDocumentStatus(approval, "Rejected");

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

        // Find current pending step
        PmApprovalStepStatus pendingStep = approval.getStepStatuses().stream()
                .filter(ss -> ss.getStatus() == ApprovalStatus.PENDING && !ss.getIsCompleted())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No pending step found."));

        // Update step
        pendingStep.setStatus(ApprovalStatus.NEED_REVISION);
        pendingStep.setApprover(userId);
        pendingStep.setApproverName(userName);
        pendingStep.setApprovalDate(Instant.now());
        pendingStep.setComment(comment);
        pendingStep.setIsCompleted(true);
        stepStatusRepository.save(pendingStep);

        // Update approval
        approval.setStatus(ApprovalStatus.NEED_REVISION);
        approval.setCurrentStep(null);
        approvalRepository.save(approval);

        // Log
        createLog(approval, pendingStep, "REVISE", userId, userName, comment,
                ApprovalStatus.PENDING, ApprovalStatus.NEED_REVISION);

        notificationService.notifyRevisionRequested(approval);

        // ✅ อัปเดตสถานะเอกสารเป็น Need Revision
        updateDocumentStatus(approval, "Need Revision");

        return toResponse(approval);
    }

    @Override
    @Transactional
    public ApprovalResponse cancel(UUID approvalId, String reason) {
        String userId = currentUserService.getUserId();

        PmApproval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found"));

        // Only requester or admin can cancel
        if (!userId.equals(approval.getRequestedBy()) && !isAdmin(userId)) {
            throw new IllegalStateException("Only the requester or admin can cancel this approval.");
        }

        if (approval.getStatus().isFinal()) {
            throw new IllegalStateException("Cannot cancel a " + approval.getStatus() + " approval.");
        }

        approval.setStatus(ApprovalStatus.CANCELLED);
        approval.setIsActive(false);
        approval.setCurrentStep(null);
        approvalRepository.save(approval);

        createLog(approval, null, "CANCEL", userId, currentUserService.getUsername(),
                reason, approval.getStatus(), ApprovalStatus.CANCELLED);

        return toResponse(approval);
    }

    @Override
    @Transactional
    public ApprovalResponse delegate(UUID approvalId, String delegateToUserId, String comment) {
        String userId = currentUserService.getUserId();
        String userName = currentUserService.getUsername();

        PmApproval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found"));

        // Find current pending step for this approver
        PmApprovalStepStatus pendingStep = approval.getStepStatuses().stream()
                .filter(ss -> ss.getStatus() == ApprovalStatus.PENDING
                        && !ss.getIsCompleted()
                        && userId.equals(ss.getApprover()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No pending step found for you to delegate."));

        // Update step - assign to new approver
        pendingStep.setApprover(delegateToUserId);
        // TODO: Get delegate name from profile
        pendingStep.setApproverName(delegateToUserId);
        stepStatusRepository.save(pendingStep);

        createLog(approval, pendingStep, "DELEGATE", userId, userName,
                "Delegated to " + delegateToUserId + ". " + comment,
                ApprovalStatus.PENDING, ApprovalStatus.PENDING);

        notificationService.notifyDelegate(approval, delegateToUserId);

        return toResponse(approval);
    }

    // ============================================================
    // 4. Utility
    // ============================================================
    @Override
    public boolean canApprove(UUID approvalId, String userId) {
        PmApproval approval = approvalRepository.findById(approvalId)
                .orElse(null);

        if (approval == null) return false;
        if (approval.getStatus().isFinal()) return false;

        // Check if user has pending step
        return approval.getStepStatuses().stream()
                .anyMatch(ss -> ss.getStatus() == ApprovalStatus.PENDING
                        && !ss.getIsCompleted()
                        && userId.equals(ss.getApprover())
                        && (approval.getFlow().getApprovalMode() != ApprovalMode.CHAIN 
                            || approval.getCurrentStep() == null 
                            || ss.getStep().getId().equals(approval.getCurrentStep().getId())));
    }

    @Override
    public boolean isApproved(String documentType, UUID documentId) {
        return approvalRepository.findByDocumentAndStatus(documentType, documentId, ApprovalStatus.APPROVED)
                .isPresent();
    }

    @Override
    public ApprovalStatus getCurrentStatus(String documentType, UUID documentId) {
        return approvalRepository.findActiveByDocument(documentType, documentId)
                .stream()
                .findFirst()
                .map(PmApproval::getStatus)
                .orElse(null);
    }

    @Override
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
    public void validateDocument(String documentType, UUID documentId) {
        // TODO: Implement validation for each document type
        log.info("Validating document: type={}, id={}", documentType, documentId);
    }

    // ============================================================
    // 5. Private Helpers
    // ============================================================

    private String getUserName(String userId) {
        if (userId == null) return null;
        return profileRepository.findByUserId(userId)
                .map(LocalizationHelper::getFullName)
                .orElse(userId);
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
        log.setNewStatus(newStatus != null ? newStatus : oldStatus);
        logRepository.save(log);
    }

    private boolean isAdmin(String userId) {
        // TODO: Check if user has ADMIN role
        return false;
    }

    // ✅ Helper: อัปเดตสถานะเอกสารตามประเภท
    private void updateDocumentStatus(PmApproval approval, String newStatus) {
        String docType = approval.getDocumentType();
        UUID docId = approval.getDocumentId();
        String actor = approval.getUpdatedBy() != null ? approval.getUpdatedBy() : currentUserService.getUserId();

        try {
            if ("CHANGE_REQUEST".equals(docType)) {
                PmRequirementChangeRequest changeRequest = changeRequestRepository.findById(docId)
                        .orElse(null);
                if (changeRequest != null) {
                    changeRequest.setStatus(newStatus);
                    changeRequest.setUpdatedBy(actor);
                    changeRequest.setUpdatedDate(Instant.now());
                    changeRequestRepository.save(changeRequest);
                    log.info("Updated Change Request {} status to {}", docId, newStatus);
                }
            } else if ("REQUIREMENT".equals(docType)) {
                PmRequirement requirement = requirementRepository.findById(docId)
                        .orElse(null);
                if (requirement != null) {
                    requirement.setStatus(newStatus);
                    requirement.setUpdatedBy(actor);
                    requirement.setUpdatedDate(Instant.now());
                    requirementRepository.save(requirement);
                    log.info("Updated Requirement {} status to {}", docId, newStatus);
                }
            }
            // สามารถเพิ่ม Document Type อื่นๆ ได้ที่นี่ (SPECIFICATION, DELIVERY, etc.)
        } catch (Exception e) {
            log.error("Failed to update document status for {}/{}: {}", docType, docId, e.getMessage(), e);
        }
    }

    // ✅ Helper: อัปเดตสถานะเอกสารเมื่อส่งขออนุมัติ
    private void updateDocumentStatusOnSubmit(PmApproval approval) {
        String docType = approval.getDocumentType();
        UUID docId = approval.getDocumentId();
        String actor = approval.getRequestedBy();

        try {
            if ("CHANGE_REQUEST".equals(docType)) {
                PmRequirementChangeRequest changeRequest = changeRequestRepository.findById(docId)
                        .orElse(null);
                if (changeRequest != null) {
                    changeRequest.setStatus("In Review");
                    changeRequest.setUpdatedBy(actor);
                    changeRequest.setUpdatedDate(Instant.now());
                    changeRequestRepository.save(changeRequest);
                    log.info("Change Request {} status set to In Review on submit", docId);
                }
            } else if ("REQUIREMENT".equals(docType)) {
                PmRequirement requirement = requirementRepository.findById(docId)
                        .orElse(null);
                if (requirement != null) {
                    requirement.setStatus("In Review");
                    requirement.setUpdatedBy(actor);
                    requirement.setUpdatedDate(Instant.now());
                    requirementRepository.save(requirement);
                    log.info("Requirement {} status set to In Review on submit", docId);
                }
            }
        } catch (Exception e) {
            log.error("Failed to update document status on submit for {}/{}: {}", docType, docId, e.getMessage(), e);
        }
    }

    // ============================================================
    // 6. Response Mapping
    // ============================================================
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
        response.setStatusText(getStatusText(approval.getStatus()));
        response.setStatusColor(getStatusColor(approval.getStatus()));
        response.setComment(approval.getComment());
        response.setFinalApprover(approval.getFinalApprover());
        response.setFinalApprovalDate(approval.getFinalApprovalDate());
        response.setFlowCode(approval.getFlow().getFlowCode());
        response.setFlowName(approval.getFlow().getFlowName());
        response.setApprovalMode(approval.getFlow().getApprovalMode().name());

        // Current step
        if (approval.getCurrentStep() != null) {
            response.setCurrentStep(toStepResponse(approval.getCurrentStep(), approval));
        }

        // All steps
        List<ApprovalStepResponse> steps = approval.getStepStatuses().stream()
                .map(ss -> toStepResponse(ss, approval))
                .collect(Collectors.toList());
        response.setSteps(steps);

        // Logs
        List<ApprovalLogResponse> logs = approval.getLogs().stream()
                .map(this::toLogResponse)
                .collect(Collectors.toList());
        response.setLogs(logs);

        // Permission for current user
        String currentUserId = currentUserService.getUserId();
        response.setCanApprove(canApprove(approval.getId(), currentUserId));
        response.setCanReject(canApprove(approval.getId(), currentUserId));
        response.setCanRevise(canApprove(approval.getId(), currentUserId));
        response.setCanCancel(currentUserId.equals(approval.getRequestedBy()) || isAdmin(currentUserId));

        return response;
    }

    private ApprovalStepResponse toStepResponse(PmApprovalFlowStep step, PmApproval approval) {
        PmApprovalStepStatus status = approval.getStepStatuses().stream()
                .filter(ss -> ss.getStep().getId().equals(step.getId()))
                .findFirst()
                .orElse(null);

        ApprovalStepResponse response = new ApprovalStepResponse();
        response.setStepId(step.getId());
        response.setStepOrder(step.getStepOrder());
        response.setStepName(step.getStepName());
        response.setApproverRole(step.getApproverRole());
        response.setApproverUserId(step.getApproverUserId());
        response.setIsRequired(step.getIsRequired());
        response.setTimeoutDays(step.getTimeoutDays());

        if (status != null) {
            response.setId(status.getId());
            response.setStatus(status.getStatus());
            response.setStatusText(getStatusText(status.getStatus()));
            response.setStatusColor(getStatusColor(status.getStatus()));
            response.setApprovalDate(status.getApprovalDate());
            response.setComment(status.getComment());
            response.setApproverName(status.getApproverName());
            response.setComplete(status.getIsCompleted());

            // Check if this is current step
            boolean isCurrent = status.getStatus() == ApprovalStatus.PENDING && !status.getIsCompleted();
            response.setCurrent(isCurrent);

            // Check if step is complete
            response.setComplete(status.getIsCompleted() || status.getStatus() == ApprovalStatus.APPROVED);
        }

        return response;
    }

    private ApprovalStepResponse toStepResponse(PmApprovalStepStatus status, PmApproval approval) {
        ApprovalStepResponse response = new ApprovalStepResponse();
        response.setId(status.getId());
        response.setStepId(status.getStep().getId());
        response.setStepOrder(status.getStep().getStepOrder());
        response.setStepName(status.getStep().getStepName());
        response.setApproverRole(status.getStep().getApproverRole());
        response.setApproverUserId(status.getStep().getApproverUserId());
        response.setIsRequired(status.getStep().getIsRequired()); 
        response.setTimeoutDays(status.getStep().getTimeoutDays());
        response.setStatus(status.getStatus());
        response.setStatusText(getStatusText(status.getStatus()));
        response.setStatusColor(getStatusColor(status.getStatus()));
        response.setApprovalDate(status.getApprovalDate());
        response.setComment(status.getComment());
        response.setApproverName(status.getApproverName());
        response.setComplete(status.getIsCompleted());

        boolean isCurrent = status.getStatus() == ApprovalStatus.PENDING && !status.getIsCompleted();
        response.setCurrent(isCurrent);

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

        // Action class & icon
        switch (log.getAction()) {
            case "SUBMIT":
                response.setActionClass("text-blue-500");
                response.setActionIcon("bi bi-send");
                break;
            case "APPROVE":
                response.setActionClass("text-emerald-500");
                response.setActionIcon("bi bi-check2-circle");
                break;
            case "REJECT":
                response.setActionClass("text-red-500");
                response.setActionIcon("bi bi-x-circle");
                break;
            case "REVISE":
                response.setActionClass("text-amber-500");
                response.setActionIcon("bi bi-pencil");
                break;
            case "CANCEL":
                response.setActionClass("text-gray-500");
                response.setActionIcon("bi bi-x-lg");
                break;
            case "DELEGATE":
                response.setActionClass("text-purple-500");
                response.setActionIcon("bi bi-person-arrow-right");
                break;
            default:
                response.setActionClass("text-gray-500");
                response.setActionIcon("bi bi-circle");
        }

        return response;
    }

    private String getStatusText(ApprovalStatus status) {
        if (status == null) return "-";
        switch (status) {
            case PENDING: return "รอดำเนินการ";
            case PARTIALLY_APPROVED: return "อนุมัติบางส่วน";
            case APPROVED: return "อนุมัติแล้ว";
            case REJECTED: return "ปฏิเสธ";
            case NEED_REVISION: return "ต้องแก้ไข";
            case CANCELLED: return "ยกเลิก";
            case EXPIRED: return "หมดอายุ";
            default: return status.name();
        }
    }

    private String getStatusColor(ApprovalStatus status) {
        if (status == null) return "bg-gray-100 text-gray-600";
        switch (status) {
            case PENDING: return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
            case PARTIALLY_APPROVED: return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case APPROVED: return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
            case REJECTED: return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            case NEED_REVISION: return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
            case CANCELLED: return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
            case EXPIRED: return "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400";
            default: return "bg-gray-100 text-gray-600";
        }
    }
}