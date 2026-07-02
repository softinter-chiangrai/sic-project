package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.dto.request.PmCustomerContractRequest;
import com.softinter.sicapi.dto.response.ComboboxResponse;
import com.softinter.sicapi.dto.response.PmCustomerContractResponse;
import com.softinter.sicapi.service.BusinessAccessService;
import com.softinter.sicapi.service.PmCustomerContractService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pm/contracts")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "PmCustomerContract", description = "API สำหรับสัญญาลูกค้า")
public class PmCustomerContractController {

    private final PmCustomerContractService contractService;
    private final BusinessAccessService businessAccessService;

    // ===== รายการสัญญา =====
    @GetMapping
    @Operation(summary = "ดึงรายการสัญญาแบบแบ่งหน้า")
    public ResponseEntity<Page<PmCustomerContractResponse>> getContracts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String contractType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "contractNo") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        UUID businessId = businessAccessService.getBusinessId();
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        return ResponseEntity.ok(
                contractService.getContracts(businessId, keyword, status, contractType, pageable)
        );
    }

    // ===== ดึงข้อมูลสัญญาเดี่ยว =====
    @GetMapping("/{id}")
    @Operation(summary = "ดึงข้อมูลสัญญาตาม ID")
    public ResponseEntity<PmCustomerContractResponse> getContract(@PathVariable UUID id) {
        return ResponseEntity.ok(contractService.getContract(id));
    }

    // ===== บันทึกสัญญา =====
    @PostMapping("/save")
    @Operation(summary = "บันทึกสัญญา (เพิ่มหรือแก้ไข)")
    public ResponseEntity<UUID> saveContract(@Valid @RequestBody PmCustomerContractRequest request) {
        UUID businessId = businessAccessService.getBusinessId();
        return ResponseEntity.ok(contractService.saveContract(businessId, request));
    }

    // ===== ลบสัญญา =====
    @DeleteMapping("/{id}")
    @Operation(summary = "ลบสัญญา")
    public ResponseEntity<Void> deleteContract(@PathVariable UUID id) {
        contractService.deleteContract(id);
        return ResponseEntity.noContent().build();
    }

    // ===== Lov & Combobox =====
    @GetMapping("/lov-contract-type")
    @Operation(summary = "ดึงรายการประเภทสัญญา")
    public ResponseEntity<List<ComboboxResponse>> getLovContractTypes() {
        return ResponseEntity.ok(contractService.getLovContractTypes());
    }

    @GetMapping("/lov-sign-status")
    @Operation(summary = "ดึงรายการสถานะลงนาม")
    public ResponseEntity<List<ComboboxResponse>> getLovSignStatuses() {
        return ResponseEntity.ok(contractService.getLovSignStatuses());
    }

    // ✅ Combobox Project (กรองตาม customerId)
    @GetMapping("/combobox-project")
    @Operation(summary = "ดึงรายการโครงการตามลูกค้า (Combobox)")
    public ResponseEntity<List<ComboboxResponse>> getComboboxProjects(
            @RequestParam(required = false) UUID customerId
    ) {
        UUID businessId = businessAccessService.getBusinessId();
        return ResponseEntity.ok(contractService.getComboboxProjects(businessId, customerId));
    }
}