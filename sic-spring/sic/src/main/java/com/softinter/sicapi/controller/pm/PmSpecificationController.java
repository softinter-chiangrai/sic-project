package com.softinter.sicapi.controller.pm;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmSpecificationRequest;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.dto.response.PmSpecificationResponse;
import com.softinter.sicapi.dto.response.SpecificationDraft;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmSpecificationService;
import com.softinter.sicapi.service.impl.SpecificationGeneratorService;
import com.softinter.sicapi.util.PaginationUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pm/specification")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Specification", description = "Specification Management API (PMDT08)")
public class PmSpecificationController {

    private final PmSpecificationService specificationService;
    private final SpecificationGeneratorService generatorService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @Operation(summary = "Get specifications with pagination")
    public ResponseEntity<PaginationResponse<PmSpecificationResponse>> getSpecifications(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        Page<PmSpecificationResponse> pageResult = specificationService.findAll(businessId, keyword, status, pageable);

        return ResponseEntity.ok(PaginationUtil.of(
                pageResult.getContent(),
                page,
                size,
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
}