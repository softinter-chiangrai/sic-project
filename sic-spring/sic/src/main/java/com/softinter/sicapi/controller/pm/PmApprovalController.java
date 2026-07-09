package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.dto.request.ApprovalActionRequest;
import com.softinter.sicapi.dto.request.ApprovalSearchRequest;
import com.softinter.sicapi.dto.request.ApprovalSubmitRequest;
import com.softinter.sicapi.dto.response.ApprovalFlowResponse;
import com.softinter.sicapi.dto.response.ApprovalResponse;
import com.softinter.sicapi.dto.response.ApprovalSummaryResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.service.ApprovalFlowService;
import com.softinter.sicapi.service.ApprovalService;
import com.softinter.sicapi.service.CurrentUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pm/approvals")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Approval", description = "Approval Management API")
public class PmApprovalController {

    private final ApprovalService approvalService;
    private final ApprovalFlowService flowService;
    private final CurrentUserService currentUserService;

    // ============================================================
    // 1. Submit
    // ============================================================
    @PostMapping("/submit")
    @Operation(summary = "Submit document for approval")
    public ResponseEntity<ApprovalResponse> submit(@Valid @RequestBody ApprovalSubmitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(approvalService.submitForApproval(request));
    }

    // ============================================================
    // 2. Actions
    // ============================================================
    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve document")
    public ResponseEntity<ApprovalResponse> approve(
            @PathVariable UUID id,
            @RequestBody(required = false) ApprovalActionRequest request) {
        String comment = request != null ? request.getComment() : null;
        String signature = request != null ? request.getSignature() : null;
        return ResponseEntity.ok(approvalService.approve(id, comment, signature));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject document")
    public ResponseEntity<ApprovalResponse> reject(
            @PathVariable UUID id,
            @RequestBody(required = false) ApprovalActionRequest request) {
        String comment = request != null ? request.getComment() : null;
        return ResponseEntity.ok(approvalService.reject(id, comment));
    }

    @PostMapping("/{id}/revise")
    @Operation(summary = "Request revision")
    public ResponseEntity<ApprovalResponse> requestRevision(
            @PathVariable UUID id,
            @RequestBody(required = false) ApprovalActionRequest request) {
        String comment = request != null ? request.getComment() : null;
        return ResponseEntity.ok(approvalService.requestRevision(id, comment));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel approval")
    public ResponseEntity<ApprovalResponse> cancel(
            @PathVariable UUID id,
            @RequestBody(required = false) ApprovalActionRequest request) {
        String reason = request != null ? request.getComment() : null;
        return ResponseEntity.ok(approvalService.cancel(id, reason));
    }

    @PostMapping("/{id}/delegate")
    @Operation(summary = "Delegate approval to another user")
    public ResponseEntity<ApprovalResponse> delegate(
            @PathVariable UUID id,
            @Valid @RequestBody ApprovalActionRequest request) {
        return ResponseEntity.ok(approvalService.delegate(id, request.getDelegateToUserId(), request.getComment()));
    }

    // ============================================================
    // 3. Query
    // ============================================================
    @GetMapping("/{id}")
    @Operation(summary = "Get approval by ID")
    public ResponseEntity<ApprovalResponse> getApproval(@PathVariable UUID id) {
        return ResponseEntity.ok(approvalService.getApproval(id));
    }

    @GetMapping("/document")
    @Operation(summary = "Get approvals by document")
    public ResponseEntity<PaginationResponse<ApprovalResponse>> getByDocument(
            @RequestParam String documentType,
            @RequestParam UUID documentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(approvalService.getApprovalsByDocument(documentType, documentId, page, size));
    }

    @GetMapping("/pending")
    @Operation(summary = "Get pending approvals for current user")
    public ResponseEntity<PaginationResponse<ApprovalResponse>> getPending(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String userId = currentUserService.getUserId();
        return ResponseEntity.ok(approvalService.getPendingApprovals(userId, page, size));
    }

    @GetMapping("/my-requests")
    @Operation(summary = "Get my approval requests")
    public ResponseEntity<PaginationResponse<ApprovalResponse>> getMyRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String userId = currentUserService.getUserId();
        return ResponseEntity.ok(approvalService.getMyRequests(userId, page, size));
    }

    @GetMapping("/search")
    @Operation(summary = "Search approvals")
    public ResponseEntity<PaginationResponse<ApprovalResponse>> search(@Valid ApprovalSearchRequest request) {
        return ResponseEntity.ok(approvalService.searchApprovals(request));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get approval summary")
    public ResponseEntity<ApprovalSummaryResponse> getSummary() {
        return ResponseEntity.ok(approvalService.getSummary());
    }

    @GetMapping("/{id}/can-approve")
    @Operation(summary = "Check if user can approve")
    public ResponseEntity<Boolean> canApprove(@PathVariable UUID id) {
        String userId = currentUserService.getUserId();
        return ResponseEntity.ok(approvalService.canApprove(id, userId));
    }

    @GetMapping("/document/status")
    @Operation(summary = "Get approval status of a document")
    public ResponseEntity<ApprovalResponse> getDocumentStatus(
            @RequestParam String documentType,
            @RequestParam UUID documentId) {
        // Get the latest approval for this document
        PaginationResponse<ApprovalResponse> result = approvalService.getApprovalsByDocument(documentType, documentId, 0, 1);
        if (result.getData().isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result.getData().get(0));
    }

    // ============================================================
    // 4. Flows
    // ============================================================
    @GetMapping("/flows")
    @Operation(summary = "Get all approval flows")
    public ResponseEntity<List<ApprovalFlowResponse>> getAllFlows() {
        return ResponseEntity.ok(flowService.getAllFlows());
    }

    @GetMapping("/flows/document-type/{documentType}")
    @Operation(summary = "Get approval flows by document type")
    public ResponseEntity<List<ApprovalFlowResponse>> getFlowsByDocumentType(@PathVariable String documentType) {
        return ResponseEntity.ok(flowService.getFlowsByDocumentType(documentType));
    }

    @GetMapping("/flows/{flowId}")
    @Operation(summary = "Get approval flow by ID")
    public ResponseEntity<ApprovalFlowResponse> getFlow(@PathVariable UUID flowId) {
        return ResponseEntity.ok(flowService.getFlow(flowId));
    }

    @GetMapping("/flows/code/{flowCode}")
    @Operation(summary = "Get approval flow by code")
    public ResponseEntity<ApprovalFlowResponse> getFlowByCode(@PathVariable String flowCode) {
        return ResponseEntity.ok(flowService.getFlowByCode(flowCode));
    }

    @GetMapping("/flows/default/{documentType}")
    @Operation(summary = "Get default approval flow for document type")
    public ResponseEntity<ApprovalFlowResponse> getDefaultFlow(@PathVariable String documentType) {
        return ResponseEntity.ok(flowService.getFlowByDocumentType(documentType));
    }
}