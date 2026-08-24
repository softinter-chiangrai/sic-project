package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmInvoiceRequest;
import com.softinter.sicapi.dto.response.PmInvoiceResponse;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmInvoiceService;
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
@RequestMapping("/api/pm/invoices")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "PM Invoice Management", description = "PM Invoice Management API")
public class PmInvoiceController {

    private final PmInvoiceService invoiceService;
    private final com.softinter.sicapi.service.PmInvoiceExportService exportService;
    private final CurrentUserService currentUserService;

    @GetMapping("/{id}/export-pdf")
    @Operation(summary = "Export Invoice Document as PDF using JasperReports")
    public ResponseEntity<byte[]> exportPdf(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        byte[] pdfBytes = exportService.exportInvoicePdf(id, businessId);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"invoice-" + id + ".pdf\"")
                .body(pdfBytes);
    }

    @GetMapping("/paging")
    @Operation(summary = "Get invoice list with pagination")
    public ResponseEntity<Page<PmInvoiceResponse>> getPaging(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        UUID businessId = BusinessContextHolder.getBusinessId();
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(invoiceService.findAll(businessId, projectId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get invoice by ID")
    public ResponseEntity<PmInvoiceResponse> getById(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        return ResponseEntity.ok(invoiceService.findById(id, businessId));
    }

    @PostMapping("/save")
    @Operation(summary = "Save invoice")
    public ResponseEntity<UUID> save(@RequestBody PmInvoiceRequest request) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();
        return ResponseEntity.ok(invoiceService.save(request, businessId, userId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete invoice (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();
        invoiceService.delete(id, businessId, userId);
        return ResponseEntity.noContent().build();
    }
}
