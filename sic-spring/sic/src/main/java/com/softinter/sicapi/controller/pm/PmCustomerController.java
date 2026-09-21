package com.softinter.sicapi.controller.pm;

import static com.softinter.sicapi.util.PaginationUtil.of;

import java.util.List;
import java.util.UUID;

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

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmCustomerRequest;
import com.softinter.sicapi.dto.response.ComboboxResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.dto.response.PmCustomerResponse;
import com.softinter.sicapi.service.PmCustomerService;
import org.springframework.data.domain.PageRequest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pm/customers")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Customer Management", description = "APIs สำหรับจัดการข้อมูลลูกค้า")
public class PmCustomerController {

    private final PmCustomerService PmCustomerService;

    @PostMapping
    @Operation(summary = "สร้างข้อมูลลูกค้าใหม่")
    public ResponseEntity<PmCustomerResponse> create(
            @RequestParam(required = false) UUID businessId,
            @Valid @RequestBody PmCustomerRequest request) {
        UUID effectiveBusinessId = businessId != null ? businessId : BusinessContextHolder.getBusinessId();
        return ResponseEntity.status(HttpStatus.CREATED).body(PmCustomerService.create(effectiveBusinessId, request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "แก้ไขข้อมูลลูกค้า")
    public ResponseEntity<PmCustomerResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody PmCustomerRequest request) {
        return ResponseEntity.ok(PmCustomerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "ลบข้อมูลลูกค้า (Soft Delete)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        PmCustomerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "ดึงข้อมูลลูกค้าตาม ID")
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
    public ResponseEntity<PaginationResponse<PmCustomerResponse>> getAll(
            @RequestParam UUID businessId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(of(PmCustomerService.findAllByBusiness(businessId, keyword, status, pageable)));
    }

    @GetMapping("/search")
    @Operation(summary = "ค้นหาลูกค้า")
    public ResponseEntity<PaginationResponse<PmCustomerResponse>> search(
            @RequestParam UUID businessId,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(of(PmCustomerService.search(businessId, keyword, pageable)));
    }

    @GetMapping("/active")
    @Operation(summary = "รายการลูกค้าที่ active (ไม่แบ่งหน้า)")
    public ResponseEntity<List<PmCustomerResponse>> getActive(@RequestParam UUID businessId) {
        return ResponseEntity.ok(PmCustomerService.findAllActiveByBusiness(businessId));
    }

    // ===== Customer Combobox (ค้นหาได้อิสระ ไม่ต้องมี parent มาก่อน) =====
    @GetMapping("/combobox")
    @Operation(summary = "Get customer combobox list")
    public ResponseEntity<List<ComboboxResponse>> getComboboxCustomers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID value) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        if (value != null) {
            try {
                PmCustomerResponse c = PmCustomerService.findById(value);
                if (c != null && businessId.equals(c.getBusinessId())) {
                    String name = (c.getCompanyNameLocal() != null && !c.getCompanyNameLocal().isBlank())
                            ? c.getCompanyNameLocal()
                            : (c.getCompanyNameEn() != null ? c.getCompanyNameEn() : "");
                    return ResponseEntity.ok(List.of(new ComboboxResponse(c.getId().toString(), c.getCustomerCode() + " - " + name)));
                }
            } catch (Exception ignored) {
                return ResponseEntity.ok(List.of());
            }
        }
        List<PmCustomerResponse> customers = (keyword != null && !keyword.isBlank())
                ? PmCustomerService.search(businessId, keyword, PageRequest.of(0, 50)).getContent()
                : PmCustomerService.findAllActiveByBusiness(businessId);
        List<ComboboxResponse> list = customers.stream()
                .map(c -> new ComboboxResponse(c.getId().toString(),
                        c.getCustomerCode() + " - " + (c.getCompanyNameLocal() != null && !c.getCompanyNameLocal().isBlank() ? c.getCompanyNameLocal() : (c.getCompanyNameEn() != null ? c.getCompanyNameEn() : ""))))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(list);
    }
}