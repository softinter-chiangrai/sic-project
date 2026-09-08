package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmPaymentRequest;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.dto.response.PmPaymentResponse;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmPaymentService;
import com.softinter.sicapi.util.PaginationUtil;
import com.softinter.sicapi.util.SortValidator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/pm/payments")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "PM Payment Management", description = "PM Payment Management API")
public class PmPaymentController {

    private final PmPaymentService paymentService;
    private final CurrentUserService currentUserService;

    @GetMapping("/paging")
    @Operation(summary = "Get payment list with pagination")
    public ResponseEntity<PaginationResponse<PmPaymentResponse>> getPaging(
            @RequestParam(required = false) UUID invoiceId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        UUID businessId = BusinessContextHolder.getBusinessId();
        Sort sort = SortValidator.build(com.softinter.sicapi.entity.pm.PmPayment.class, sortBy, sortDirection, "createdDate");
        Pageable pageable = PaginationUtil.toPageable(page, size, sort);
        Page<PmPaymentResponse> pageResult = paymentService.findAll(businessId, invoiceId, pageable);
        return ResponseEntity.ok(PaginationUtil.of(pageResult));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID")
    public ResponseEntity<PmPaymentResponse> getById(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        return ResponseEntity.ok(paymentService.findById(id, businessId));
    }

    @PostMapping("/save")
    @Operation(summary = "Save payment")
    public ResponseEntity<UUID> save(@RequestBody PmPaymentRequest request) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();
        return ResponseEntity.ok(paymentService.save(request, businessId, userId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete payment (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();
        paymentService.delete(id, businessId, userId);
        return ResponseEntity.noContent().build();
    }
}
