package com.softinter.sicapi.controller.pm;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.softinter.sicapi.dto.request.PmCustomerRequest;
import com.softinter.sicapi.dto.response.PmCustomerResponse;
import com.softinter.sicapi.service.PmCustomerService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/su-customer")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "PmCustomer", description = "API สำหรับจัดการลูกค้า (ระบบ SU)")
public class PmCustomerController {

    private final PmCustomerService PmCustomerService;

    @PostMapping
    @Operation(summary = "สร้างลูกค้าใหม่")
    public ResponseEntity<PmCustomerResponse> create(
            @RequestParam UUID businessId,
            @Valid @RequestBody PmCustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(PmCustomerService.create(businessId, request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "แก้ไขข้อมูลลูกค้า")
    public ResponseEntity<PmCustomerResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody PmCustomerRequest request) {
        return ResponseEntity.ok(PmCustomerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "ลบลูกค้า (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        PmCustomerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "ดึงข้อมูลลูกค้าโดย id")
    public ResponseEntity<PmCustomerResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(PmCustomerService.findById(id));
    }

    @GetMapping("/code")
    @Operation(summary = "ดึงข้อมูลลูกค้าโดย customerCode")
    public ResponseEntity<PmCustomerResponse> getByCode(
            @RequestParam UUID businessId,
            @RequestParam String customerCode) {
        return ResponseEntity.ok(PmCustomerService.findByCustomerCode(businessId, customerCode));
    }

    @GetMapping
    @Operation(summary = "รายการลูกค้าทั้งหมด (แบบแบ่งหน้า)")
    public ResponseEntity<Page<PmCustomerResponse>> getAll(
            @RequestParam UUID businessId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(PmCustomerService.findAllByBusiness(businessId, pageable));
    }

    @GetMapping("/search")
    @Operation(summary = "ค้นหาลูกค้า")
    public ResponseEntity<Page<PmCustomerResponse>> search(
            @RequestParam UUID businessId,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(PmCustomerService.search(businessId, keyword, pageable));
    }

    @GetMapping("/active")
    @Operation(summary = "รายการลูกค้าที่ active (ไม่แบ่งหน้า)")
    public ResponseEntity<List<PmCustomerResponse>> getActive(@RequestParam UUID businessId) {
        return ResponseEntity.ok(PmCustomerService.findAllActiveByBusiness(businessId));
    }
}