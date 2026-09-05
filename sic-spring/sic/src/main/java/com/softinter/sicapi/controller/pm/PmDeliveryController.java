package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmDeliveryRequest;
import com.softinter.sicapi.dto.response.PmDeliveryGateCheckResponse;
import com.softinter.sicapi.dto.response.PmDeliveryResponse;
import com.softinter.sicapi.service.ApprovalService;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmDeliveryService;
import com.softinter.sicapi.dto.response.ComboboxResponse;
import com.softinter.sicapi.entity.pm.PmDelivery;
import com.softinter.sicapi.repository.pm.PmDeliveryRepository;
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

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/pm/delivery")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "PM Delivery Management", description = "PM Delivery Document Management API")
public class PmDeliveryController {

    private final PmDeliveryService deliveryService;
    private final PmDeliveryRepository deliveryRepository;
    private final com.softinter.sicapi.service.PmDeliveryExportService exportService;
    private final CurrentUserService currentUserService;
    private final ApprovalService approvalService;

    @GetMapping("/combobox")
    @Operation(summary = "Get delivery combobox list for dropdowns")
    public ResponseEntity<List<ComboboxResponse>> getCombobox(
            @RequestParam(required = false) UUID projectId) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        List<PmDelivery> deliveries;
        if (projectId != null) {
            deliveries = deliveryRepository.findByBusinessIdAndProjectIdAndIsDeleteFalseOrderByCreatedDateDesc(businessId, projectId);
        } else {
            deliveries = deliveryRepository.findByBusinessIdAndIsDeleteFalseOrderByCreatedDateDesc(businessId);
        }
        List<ComboboxResponse> list = deliveries.stream()
                .map(d -> new ComboboxResponse(
                        d.getId().toString(),
                        (d.getDeliveryCode() != null ? d.getDeliveryCode() + " - " : "") +
                        (d.getDeliveryTitle() != null ? d.getDeliveryTitle() : "เอกสารส่งมอบ") +
                        (d.getDeliveryType() != null ? " (" + d.getDeliveryType() + ")" : "")
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/paging")
    @Operation(summary = "Get delivery documents list with pagination")
    public ResponseEntity<Page<PmDeliveryResponse>> getPaging(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        UUID businessId = BusinessContextHolder.getBusinessId();
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(deliveryService.findAll(businessId, projectId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get delivery document by ID")
    public ResponseEntity<PmDeliveryResponse> getById(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        return ResponseEntity.ok(deliveryService.findById(id, businessId));
    }

    @PostMapping("/{id}/create-revision")
    @Operation(summary = "Create a new draft revision from an approved delivery document")
    public ResponseEntity<PmDeliveryResponse> createRevision(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        approvalService.createRevision("DELIVERY", id, "สร้าง Revision ใหม่จากเอกสารที่อนุมัติแล้ว");
        return ResponseEntity.ok(deliveryService.findById(id, businessId));
    }

    @PostMapping("/save")
    @Operation(summary = "Save delivery document")
    public ResponseEntity<UUID> save(@RequestBody PmDeliveryRequest request) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();
        return ResponseEntity.ok(deliveryService.save(request, businessId, userId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete delivery document (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();
        deliveryService.delete(id, businessId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/gate-check")
    @Operation(summary = "Run Delivery Gate Check for a project")
    public ResponseEntity<PmDeliveryGateCheckResponse> gateCheck(
            @RequestParam(required = false) UUID deliveryId,
            @RequestParam UUID projectId) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        return ResponseEntity.ok(deliveryService.gateCheck(deliveryId, projectId, businessId));
    }

    @GetMapping("/{id}/export-pdf")
    @Operation(summary = "Export official Delivery Handover Document as PDF using JasperReports")
    public ResponseEntity<byte[]> exportPdf(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        byte[] pdfBytes = exportService.exportDeliveryHandoverPdf(id, businessId);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"delivery-handover-" + id + ".pdf\"")
                .body(pdfBytes);
    }

    @PostMapping("/{id}/sign-off")
    @Operation(summary = "Sign-off delivery document by client")
    public ResponseEntity<PmDeliveryResponse> signOff(
            @PathVariable UUID id,
            @RequestParam String signedBy) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();
        return ResponseEntity.ok(deliveryService.signOff(id, signedBy, businessId, userId));
    }

    @PostMapping("/{id}/create-invoice")
    @Operation(summary = "Generate Invoice from accepted Delivery document")
    public ResponseEntity<UUID> createInvoice(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();
        return ResponseEntity.ok(deliveryService.createInvoiceFromDelivery(id, businessId, userId));
    }
}
