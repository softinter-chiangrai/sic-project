package com.softinter.sicapi.controller.su;

import com.softinter.sicapi.dto.request.*;
import com.softinter.sicapi.dto.response.*;
import com.softinter.sicapi.entity.su.SuBusinessRole;
import com.softinter.sicapi.repository.su.SuBusinessRoleRepository;
import com.softinter.sicapi.service.ProgramAccessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/su/business-roles")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Business Role", description = "Business Role Management API")
public class SuBusinessRoleController {

    private final SuBusinessRoleRepository businessRoleRepository;
    private final ProgramAccessService programAccessService;

    @GetMapping
    @Operation(summary = "Get all business roles")
    public ResponseEntity<ApiResponse<List<BusinessRoleResponse>>> getAll(
            @RequestParam(required = false) UUID businessId) {
        List<SuBusinessRole> roles;
        if (businessId != null) {
            roles = businessRoleRepository.findAllByBusinessId(businessId);
        } else {
            roles = businessRoleRepository.findAll();
        }
        List<BusinessRoleResponse> response = roles.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/paging")
    @Operation(summary = "Get business roles with pagination")
    public ResponseEntity<ApiResponse<PaginationResponse<BusinessRoleResponse>>> paging(
            @Valid @ModelAttribute BusinessRolePageRequest request) {
        Pageable pageable = PageRequest.of(
                request.getPageNumber() - 1,
                request.getPageSize(),
                Sort.by("roleCode").ascending());

        Specification<SuBusinessRole> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("isDelete"), false));
            if (request.getBusinessId() != null) {
                predicates.add(cb.equal(root.get("business").get("id"), request.getBusinessId()));
            }
            if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
                String keyword = "%" + request.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("roleCode")), keyword),
                        cb.like(cb.lower(root.get("roleNameEn")), keyword),
                        cb.like(cb.lower(root.get("roleNameLocal")), keyword)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<SuBusinessRole> page = businessRoleRepository.findAll(spec, pageable);
        List<BusinessRoleResponse> data = page.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        PaginationResponse<BusinessRoleResponse> response = new PaginationResponse<>();
        response.setData(data);
        com.softinter.sicapi.dto.Pageable pageableDto = new com.softinter.sicapi.dto.Pageable();
        pageableDto.setPageNumber(request.getPageNumber());
        pageableDto.setPageSize(request.getPageSize());
        pageableDto.setTotalElements(page.getTotalElements());
        pageableDto.calculateTotalPages();
        response.setPageable(pageableDto);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/lov")
    @Operation(summary = "Get business role LOV")
    public ResponseEntity<ApiResponse<List<LovResponse>>> lov(@RequestParam UUID businessId) {
        List<LovResponse> lov = businessRoleRepository.findActiveByBusinessId(businessId)
                .stream()
                .map(r -> new LovResponse(r.getId(), r.getRoleNameEn()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(lov));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get business role by ID")
    public ResponseEntity<ApiResponse<BusinessRoleResponse>> getById(@PathVariable UUID id) {
        SuBusinessRole role = businessRoleRepository.findByIdWithParent(id)
                .orElseThrow(() -> new RuntimeException("Business role not found"));
        return ResponseEntity.ok(ApiResponse.success(toResponse(role)));
    }

    @PostMapping("/save")
    @Operation(summary = "Save business role")
    public ResponseEntity<ApiResponse<UUID>> save(@Valid @RequestBody SaveBusinessRoleRequest request) {
        SuBusinessRole role;
        if (request.getId() != null) {
            role = businessRoleRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("Business role not found"));
            if (request.getRowVersion() != null) {
                // Optimistic locking check
            }
        } else {
            role = new SuBusinessRole();
        }
        role.setRoleCode(request.getRoleCode());
        role.setRoleNameEn(request.getRoleNameEn());
        role.setRoleNameLocal(request.getRoleNameLocal());
        role.setRoleLevel(request.getRoleLevel());
        role.setSortOrder(request.getSortOrder());
        role.setIsActive(request.isActive());
        businessRoleRepository.save(role);

        programAccessService.removeAllAccessCache();
        return ResponseEntity.ok(ApiResponse.success(role.getId()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete business role")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id, @RequestBody DeleteRequest request) {
        SuBusinessRole role = businessRoleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business role not found"));
        role.setIsDelete(true);
        role.setIsActive(false);
        businessRoleRepository.save(role);
        programAccessService.removeAllAccessCache();
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private BusinessRoleResponse toResponse(SuBusinessRole role) {
        BusinessRoleResponse response = new BusinessRoleResponse();
        response.setId(role.getId());
        if (role.getBusiness() != null) {
            response.setBusinessId(role.getBusiness().getId());
        }
        if (role.getParentRole() != null) {
            response.setParentRoleId(role.getParentRole().getId());
            response.setParentRoleCode(role.getParentRole().getRoleCode());
        }
        response.setRoleCode(role.getRoleCode());
        response.setRoleNameEn(role.getRoleNameEn());
        response.setRoleNameLocal(role.getRoleNameLocal());
        response.setRoleLevel(role.getRoleLevel());
        response.setSortOrder(role.getSortOrder());
        response.setActive(Boolean.TRUE.equals(role.getIsActive()));
        response.setRowVersion(role.getRowVersion());
        return response;
    }
}
