// ============================================================
// 6. ApprovalService.java (เพิ่ม method)
// ============================================================
package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.ApprovalSearchRequest;
import com.softinter.sicapi.dto.request.ApprovalSubmitRequest;
import com.softinter.sicapi.dto.response.ApprovalResponse;
import com.softinter.sicapi.dto.response.ApprovalSummaryResponse;
import com.softinter.sicapi.dto.response.CancelApprovalResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.entity.enums.ApprovalStatus;

import java.util.UUID;

public interface ApprovalService {

    ApprovalResponse submitForApproval(ApprovalSubmitRequest request);

    ApprovalResponse getApproval(UUID id);

    PaginationResponse<ApprovalResponse> getApprovalsByDocument(String documentType, UUID documentId, int page, int size);

    PaginationResponse<ApprovalResponse> getPendingApprovals(String userId, int page, int size);

    PaginationResponse<ApprovalResponse> getApprovedHistory(String userId, int page, int size);

    PaginationResponse<ApprovalResponse> getMyRequests(String userId, int page, int size);

    PaginationResponse<ApprovalResponse> searchApprovals(ApprovalSearchRequest request);

    ApprovalResponse approve(UUID approvalId, String comment, String signature);

    ApprovalResponse reject(UUID approvalId, String comment);

    ApprovalResponse requestRevision(UUID approvalId, String comment);

    ApprovalResponse cancel(UUID approvalId, String reason);

    ApprovalResponse delegate(UUID approvalId, String delegateToUserId, String comment);

    boolean canApprove(UUID approvalId, String userId);

    boolean isApproved(String documentType, UUID documentId);

    ApprovalStatus getCurrentStatus(String documentType, UUID documentId);

    ApprovalSummaryResponse getSummary();

    void validateDocument(String documentType, UUID documentId);

    CancelApprovalResponse cancelByFlow(UUID flowId, String reason);
}