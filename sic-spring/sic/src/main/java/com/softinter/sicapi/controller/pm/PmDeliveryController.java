package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmDeliveryRequest;
import com.softinter.sicapi.dto.response.PmDeliveryGateCheckResponse;
import com.softinter.sicapi.dto.response.PmDeliveryResponse;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmDeliveryService;
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
@RequestMapping("/api/pm/delivery")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "PM Delivery Management", description = "PM Delivery Document Management API")
public class PmDeliveryController {

    private final PmDeliveryService deliveryService;
    private final CurrentUserService currentUserService;

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
}
