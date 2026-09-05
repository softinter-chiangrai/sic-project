package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.dto.request.ChangeRequestRequest;
import com.softinter.sicapi.dto.response.ChangeRequestResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.service.ApprovalService;
import com.softinter.sicapi.service.ChangeRequestService;
import com.softinter.sicapi.service.PmChangeRequestExportService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/pm/change-requests")
@RequiredArgsConstructor
public class PmChangeRequestController {

    private final ChangeRequestService changeRequestService;
    private final PmChangeRequestExportService changeRequestExportService;
    private final ApprovalService approvalService;

    @PostMapping
    public ResponseEntity<ChangeRequestResponse> create(@Valid @RequestBody ChangeRequestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(changeRequestService.createChangeRequest(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChangeRequestResponse> update(@PathVariable UUID id, @Valid @RequestBody ChangeRequestRequest request) {
        return ResponseEntity.ok(changeRequestService.updateChangeRequest(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChangeRequestResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(changeRequestService.getChangeRequest(id));
    }

    @GetMapping
    public ResponseEntity<PaginationResponse<ChangeRequestResponse>> list(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) String targetType,
            @RequestParam(required = false) UUID targetId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(changeRequestService.listChangeRequests(projectId, targetType, targetId, status, pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        changeRequestService.deleteChangeRequest(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ChangeRequestResponse> submit(@PathVariable UUID id) {
        return ResponseEntity.ok(changeRequestService.submitForApproval(id));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ChangeRequestResponse> approve(@PathVariable UUID id) {
        // TODO: get current user as approver
        return ResponseEntity.ok(changeRequestService.approve(id, "system"));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ChangeRequestResponse> reject(@PathVariable UUID id) {
        return ResponseEntity.ok(changeRequestService.reject(id, "reason"));
    }

    @PostMapping("/{id}/implement")
    public ResponseEntity<ChangeRequestResponse> implement(@PathVariable UUID id) {
        return ResponseEntity.ok(changeRequestService.implement(id));
    }

    @PostMapping("/{id}/assignees/complete")
    public ResponseEntity<ChangeRequestResponse> completeAssignee(
            @PathVariable UUID id,
            @RequestParam String userId,
            @RequestParam UUID targetId) {
        return ResponseEntity.ok(changeRequestService.markAssigneeComplete(id, userId, targetId));
    }

    @PostMapping("/{id}/create-revision")
    public ResponseEntity<ChangeRequestResponse> createRevision(@PathVariable UUID id) {
        approvalService.createRevision("CHANGE_REQUEST", id, "สร้าง Revision ใหม่จากเอกสารที่อนุมัติแล้ว");
        return ResponseEntity.ok(changeRequestService.getChangeRequest(id));
    }

    @GetMapping("/{id}/export-pdf")
    public ResponseEntity<byte[]> exportPdf(@PathVariable UUID id) {
        byte[] pdfBytes = changeRequestExportService.exportChangeRequestPdf(id);

        String filename = "CR_" + id.toString().substring(0, 8).toUpperCase() + ".pdf";
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}