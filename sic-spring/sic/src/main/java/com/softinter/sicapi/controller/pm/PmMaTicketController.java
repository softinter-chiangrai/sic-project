package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmMaTicketRequest;
import com.softinter.sicapi.dto.response.PmMaTicketResponse;
import com.softinter.sicapi.service.ApprovalService;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmMaTicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/pm/ma-tickets")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "PM MA Ticket Management", description = "PM MA / Support Ticket Management API")
public class PmMaTicketController {

    private final PmMaTicketService ticketService;
    private final com.softinter.sicapi.service.PmMaTicketExportService exportService;
    private final CurrentUserService currentUserService;
    private final ApprovalService approvalService;

    @GetMapping("/{id}/export-pdf")
    @Operation(summary = "Export MA Ticket Document as PDF using JasperReports")
    public ResponseEntity<byte[]> exportPdf(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        byte[] pdfBytes = exportService.exportTicketPdf(id, businessId);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"ma-ticket-" + id + ".pdf\"")
                .body(pdfBytes);
    }

    @GetMapping("/paging")
    @Operation(summary = "Get MA tickets list with pagination")
    public ResponseEntity<Page<PmMaTicketResponse>> getPaging(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        UUID businessId = BusinessContextHolder.getBusinessId();
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(ticketService.findAll(businessId, projectId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get MA ticket by ID")
    public ResponseEntity<PmMaTicketResponse> getById(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        return ResponseEntity.ok(ticketService.findById(id, businessId));
    }

    @PostMapping("/{id}/create-revision")
    @Operation(summary = "Create a new draft revision from an approved MA ticket")
    public ResponseEntity<PmMaTicketResponse> createRevision(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        approvalService.createRevision("MA_TICKET", id, "สร้าง Revision ใหม่จากเอกสารที่อนุมัติแล้ว");
        return ResponseEntity.ok(ticketService.findById(id, businessId));
    }

    @PostMapping("/save")
    @Operation(summary = "Save MA ticket")
    public ResponseEntity<UUID> save(@RequestBody PmMaTicketRequest request) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();
        return ResponseEntity.ok(ticketService.save(request, businessId, userId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete MA ticket (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();
        ticketService.delete(id, businessId, userId);
        return ResponseEntity.noContent().build();
    }
}
