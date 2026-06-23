package com.softinter.sicapi.controller.su;

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

import com.softinter.sicapi.dto.request.SuCustomerRequest;
import com.softinter.sicapi.dto.response.SuCustomerResponse;
import com.softinter.sicapi.service.SuCustomerService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/su-customer")
@RequiredArgsConstructor
@Tag(name = "SuCustomer", description = "API สำหรับจัดการลูกค้า (ระบบ SU)")
public class SuCustomerController {

    private final SuCustomerService suCustomerService;

    @PostMapping
    @Operation(summary = "สร้างลูกค้าใหม่")
    public ResponseEntity<SuCustomerResponse> create(@RequestParam UUID businessId,
                                                     @Valid @RequestBody SuCustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(suCustomerService.create(businessId, request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "แก้ไขข้อมูลลูกค้า")
    public ResponseEntity<SuCustomerResponse> update(@PathVariable UUID id,
                                                     @Valid @RequestBody SuCustomerRequest request) {
        return ResponseEntity.ok(suCustomerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "ลบลูกค้า (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        suCustomerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "ดึงข้อมูลลูกค้าโดย id")
    public ResponseEntity<SuCustomerResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(suCustomerService.findById(id));
    }

    @GetMapping("/code")
    @Operation(summary = "ดึงข้อมูลลูกค้าโดย customerCode")
    public ResponseEntity<SuCustomerResponse> getByCode(@RequestParam UUID businessId,
                                                        @RequestParam String customerCode) {
        return ResponseEntity.ok(suCustomerService.findByCustomerCode(businessId, customerCode));
    }

    @GetMapping
    @Operation(summary = "รายการลูกค้าทั้งหมด (แบบแบ่งหน้า)")
    public ResponseEntity<Page<SuCustomerResponse>> getAll(@RequestParam UUID businessId,
                                                           @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(suCustomerService.findAllByBusiness(businessId, pageable));
    }

    @GetMapping("/search")
    @Operation(summary = "ค้นหาลูกค้า")
    public ResponseEntity<Page<SuCustomerResponse>> search(@RequestParam UUID businessId,
                                                           @RequestParam(required = false) String keyword,
                                                           @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(suCustomerService.search(businessId, keyword, pageable));
    }

    @GetMapping("/active")
    @Operation(summary = "รายการลูกค้าที่ active (ไม่แบ่งหน้า)")
    public ResponseEntity<List<SuCustomerResponse>> getActive(@RequestParam UUID businessId) {
        return ResponseEntity.ok(suCustomerService.findAllActiveByBusiness(businessId));
    }
}