package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmSpecificationRequest;
import com.softinter.sicapi.dto.response.ComboboxResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.dto.response.PmSpecificationResponse;
import com.softinter.sicapi.dto.response.SpecificationDraft;
import com.softinter.sicapi.entity.pm.PmSpecification;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmSpecificationService;
import com.softinter.sicapi.service.impl.SpecificationGeneratorService;
import com.softinter.sicapi.util.PaginationUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pm/specifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Specification", description = "จัดการข้อมูลข้อกำหนด (Specification)")
public class PmSpecificationController {

    private final PmSpecificationService specificationService;
    private final SpecificationGeneratorService generatorService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @Operation(summary = "Get specifications with pagination")
    public ResponseEntity<PaginationResponse<PmSpecificationResponse>> getSpecifications(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10, sort = "createdDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }

        Page<PmSpecificationResponse> pageResult = specificationService.findAll(businessId, keyword, status, pageable);

        return ResponseEntity.ok(PaginationUtil.of(
                pageResult.getContent(),
                pageable.getPageNumber(),
                pageable.getPageSize(),
                pageResult.getTotalElements()
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specification by ID")
    public ResponseEntity<PmSpecificationResponse> getById(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(specificationService.findById(id, businessId));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get specification by code")
    public ResponseEntity<PmSpecificationResponse> getByCode(@PathVariable String code) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(specificationService.getByCode(businessId, code));
    }

    @PostMapping
    @Operation(summary = "Create or update specification")
    public ResponseEntity<UUID> save(@Valid @RequestBody PmSpecificationRequest request) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = currentUserService.getUserId();
        UUID id = specificationService.save(request, businessId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(id);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete specification")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = currentUserService.getUserId();
        specificationService.delete(id, businessId, userId);
        return ResponseEntity.noContent().build();
    }

    // ===== AI Generator =====
    @PostMapping("/generate/draft")
    @Operation(summary = "Generate specification draft using AI")
    public ResponseEntity<SpecificationDraft> generateDraft(
            @RequestParam UUID requirementId,
            @RequestParam UUID diagramId
    ) {
        SpecificationDraft draft = generatorService.generateDraft(requirementId, diagramId);
        return ResponseEntity.ok(draft);
    }

    // ===== Combobox =====
    @GetMapping("/combobox")
    @Operation(summary = "Get specification combobox list")
    public ResponseEntity<List<ComboboxResponse>> getComboboxSpecifications(
            @RequestParam(required = false) UUID projectId
    ) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        List<PmSpecification> specs = specificationService.findByBusinessIdAndProjectId(businessId, projectId);
        List<ComboboxResponse> list = specs.stream()
                .map(s -> new ComboboxResponse(s.getId().toString(),
                        s.getSpecificationCode() + " - " + s.getTitle()))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(list);
    }
}