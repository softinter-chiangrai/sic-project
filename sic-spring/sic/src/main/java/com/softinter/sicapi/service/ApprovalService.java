package com.softinter.sicapi.service;

import java.util.UUID;

import com.softinter.sicapi.dto.request.ApprovalSearchRequest;
import com.softinter.sicapi.dto.request.ApprovalSubmitRequest;
import com.softinter.sicapi.dto.response.ApprovalResponse;
import com.softinter.sicapi.dto.response.ApprovalSummaryResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.entity.enums.ApprovalStatus;

public interface ApprovalService {

    // ===== Submit =====
    ApprovalResponse submitForApproval(ApprovalSubmitRequest request);

    // ===== Query =====
    ApprovalResponse getApproval(UUID id);
    PaginationResponse<ApprovalResponse> getApprovalsByDocument(String documentType, UUID documentId, int page, int size);
    PaginationResponse<ApprovalResponse> getPendingApprovals(String userId, int page, int size);
    PaginationResponse<ApprovalResponse> getMyRequests(String userId, int page, int size);
    PaginationResponse<ApprovalResponse> searchApprovals(ApprovalSearchRequest request);

    // ===== Actions =====
    ApprovalResponse approve(UUID approvalId, String comment, String signature);
    ApprovalResponse reject(UUID approvalId, String comment);
    ApprovalResponse requestRevision(UUID approvalId, String comment);
    ApprovalResponse cancel(UUID approvalId, String reason);
    ApprovalResponse delegate(UUID approvalId, String delegateToUserId, String comment);

    // ===== Utility =====
    boolean canApprove(UUID approvalId, String userId);
    boolean isApproved(String documentType, UUID documentId);
    ApprovalStatus getCurrentStatus(String documentType, UUID documentId);
    ApprovalSummaryResponse getSummary();

    // ===== Validation =====
    void validateDocument(String documentType, UUID documentId);
}