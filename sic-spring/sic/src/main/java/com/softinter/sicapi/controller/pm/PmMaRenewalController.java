package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmMaRenewalRequest;
import com.softinter.sicapi.dto.response.PmMaRenewalResponse;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmMaRenewalService;
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
@RequestMapping("/api/pm/ma-renewals")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "PM MA Renewal Management", description = "PM MA Contract Renewal Management API")
public class PmMaRenewalController {

    private final PmMaRenewalService renewalService;
    private final com.softinter.sicapi.service.PmMaRenewalExportService exportService;
    private final CurrentUserService currentUserService;

    @GetMapping("/{id}/export-pdf")
    @Operation(summary = "Export MA Renewal Proposal Document as PDF using JasperReports")
    public ResponseEntity<byte[]> exportPdf(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        byte[] pdfBytes = exportService.exportRenewalPdf(id, businessId);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"ma-renewal-" + id + ".pdf\"")
                .body(pdfBytes);
    }

    @GetMapping("/paging")
    @Operation(summary = "Get MA renewal proposals list with pagination")
    public ResponseEntity<Page<PmMaRenewalResponse>> getPaging(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        UUID businessId = BusinessContextHolder.getBusinessId();
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(renewalService.findAll(businessId, projectId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get MA renewal proposal by ID")
    public ResponseEntity<PmMaRenewalResponse> getById(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        return ResponseEntity.ok(renewalService.findById(id, businessId));
    }

    @PostMapping("/save")
    @Operation(summary = "Save MA renewal proposal")
    public ResponseEntity<UUID> save(@RequestBody PmMaRenewalRequest request) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();
        return ResponseEntity.ok(renewalService.save(request, businessId, userId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete MA renewal proposal (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();
        renewalService.delete(id, businessId, userId);
        return ResponseEntity.noContent().build();
    }
}
