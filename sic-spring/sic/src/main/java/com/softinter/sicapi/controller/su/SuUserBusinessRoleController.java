package com.softinter.sicapi.controller.su;

import com.softinter.sicapi.dto.request.*;
import com.softinter.sicapi.dto.response.*;
import com.softinter.sicapi.entity.su.SuUserBusinessRole;
import com.softinter.sicapi.repository.su.SuUserBusinessRoleRepository;
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
@RequestMapping("/api/su/user-business-roles")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "User Business Role", description = "User Business Role Management API")
public class SuUserBusinessRoleController {

    private final SuUserBusinessRoleRepository userBusinessRoleRepository;

    @GetMapping
    @Operation(summary = "Get all user business roles")
    public ResponseEntity<ApiResponse<List<UserBusinessRoleResponse>>> getAll(
            @RequestParam(required = false) UUID userBusinessId) {
        List<SuUserBusinessRole> list = userBusinessRoleRepository.findAll();
        List<UserBusinessRoleResponse> response = list.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/paging")
    @Operation(summary = "Get user business roles with pagination")
    public ResponseEntity<ApiResponse<PaginationResponse<UserBusinessRoleResponse>>> paging(
            @Valid @ModelAttribute UserBusinessRolePageRequest request) {
        Pageable pageable = PageRequest.of(request.getPageNumber() - 1, request.getPageSize());

        Specification<SuUserBusinessRole> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("isDelete"), false));
            if (request.getUserBusinessId() != null) {
                predicates.add(cb.equal(root.get("userBusiness").get("id"), request.getUserBusinessId()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<SuUserBusinessRole> page = userBusinessRoleRepository.findAll(spec, pageable);
        List<UserBusinessRoleResponse> data = page.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        PaginationResponse<UserBusinessRoleResponse> response = new PaginationResponse<>();
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
    @Operation(summary = "Get user business role LOV")
    public ResponseEntity<ApiResponse<List<LovResponse>>> lov() {
        List<LovResponse> lov = userBusinessRoleRepository.findAll()
                .stream()
                .map(ubr -> new LovResponse(ubr.getId(),
                        ubr.getBusinessRole() != null ? ubr.getBusinessRole().getRoleCode() : ""))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(lov));
    }

    @PostMapping("/save")
    @Operation(summary = "Save user business role")
    public ResponseEntity<ApiResponse<UUID>> save(@Valid @RequestBody SaveUserBusinessRoleRequest request) {
        SuUserBusinessRole ubr;
        if (request.getId() != null) {
            ubr = userBusinessRoleRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("User business role not found"));
        } else {
            ubr = new SuUserBusinessRole();
        }
        ubr.setIsActive(request.isActive());
        userBusinessRoleRepository.save(ubr);
        return ResponseEntity.ok(ApiResponse.success(ubr.getId()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user business role")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        SuUserBusinessRole ubr = userBusinessRoleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User business role not found"));
        ubr.setIsDelete(true);
        ubr.setIsActive(false);
        userBusinessRoleRepository.save(ubr);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private UserBusinessRoleResponse toResponse(SuUserBusinessRole ubr) {
        UserBusinessRoleResponse response = new UserBusinessRoleResponse();
        response.setId(ubr.getId());
        if (ubr.getUserBusiness() != null) {
            response.setUserBusinessId(ubr.getUserBusiness().getId());
            response.setUserId(ubr.getUserBusiness().getUserId());
            if (ubr.getUserBusiness().getBusiness() != null) {
                response.setBusinessId(ubr.getUserBusiness().getBusiness().getId());
            }
        }
        if (ubr.getBusinessRole() != null) {
            response.setBusinessRoleId(ubr.getBusinessRole().getId());
            response.setBusinessRoleCode(ubr.getBusinessRole().getRoleCode());
            response.setBusinessRoleName(ubr.getBusinessRole().getRoleNameEn());
        }
        response.setActive(Boolean.TRUE.equals(ubr.getIsActive()));
        response.setRowVersion(ubr.getRowVersion());
        return response;
    }
}
