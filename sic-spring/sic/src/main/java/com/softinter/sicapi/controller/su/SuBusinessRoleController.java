package com.softinter.sicapi.controller.su;

import com.softinter.sicapi.dto.request.BusinessRolePageRequest;
import com.softinter.sicapi.dto.request.DeleteRequest;
import com.softinter.sicapi.dto.request.SaveBusinessRoleRequest;
import com.softinter.sicapi.dto.response.BusinessRoleResponse;
import com.softinter.sicapi.dto.response.LovResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.entity.su.SuBusiness;
import com.softinter.sicapi.entity.su.SuBusinessRole;
import com.softinter.sicapi.repository.su.SuBusinessRepository;
import com.softinter.sicapi.repository.su.SuBusinessRoleRepository;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.ProgramAccessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/su/business-roles")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Business Role", description = "Business Role Management API")
public class SuBusinessRoleController {

    private final SuBusinessRoleRepository businessRoleRepository;
    private final SuBusinessRepository businessRepository;
    private final ProgramAccessService programAccessService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @Operation(summary = "Get all business roles")
    public ResponseEntity<List<BusinessRoleResponse>> getAll(
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
        return ResponseEntity.ok(response);
    }

    @GetMapping("/paging")
    @Operation(summary = "Get business roles with pagination")
    public ResponseEntity<PaginationResponse<BusinessRoleResponse>> paging(
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

        return ResponseEntity.ok(response);
    }

    @GetMapping("/lov")
    @Operation(summary = "Get business role LOV")
    public ResponseEntity<List<LovResponse>> lov(@RequestParam UUID businessId) {
        List<LovResponse> lov = businessRoleRepository.findActiveByBusinessId(businessId)
                .stream()
                .map(r -> new LovResponse(r.getId(), r.getRoleNameEn()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(lov);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get business role by ID")
    public ResponseEntity<BusinessRoleResponse> getById(@PathVariable UUID id) {
        SuBusinessRole role = businessRoleRepository.findByIdWithParent(id)
                .orElseThrow(() -> new RuntimeException("Business role not found"));
        return ResponseEntity.ok(toResponse(role));
    }

    @PostMapping("/save")
    @Operation(summary = "Save business role")
    public ResponseEntity<UUID> save(@Valid @RequestBody SaveBusinessRoleRequest request) {
        SuBusinessRole role;

        // ===== 1. กรณีแก้ไข / เพิ่มใหม่ =====
        if (request.getId() != null) {
            role = businessRoleRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("Business role not found"));
            if (request.getRowVersion() != null) {
                role.setRowVersion(request.getRowVersion());
            }
        } else {
            role = new SuBusinessRole();
        }

        // ===== 2. ตรวจสอบ BusinessId (required) =====
        if (request.getBusinessId() == null) {
            throw new IllegalArgumentException("BusinessId is required");
        }
        SuBusiness business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new RuntimeException("Business not found: " + request.getBusinessId()));
        role.setBusiness(business);

        // ===== 3. ตรวจสอบ ParentRoleId (optional) =====
        if (request.getParentRoleId() != null) {
            SuBusinessRole parentRole = businessRoleRepository.findById(request.getParentRoleId())
                    .orElseThrow(() -> new RuntimeException("Parent role not found: " + request.getParentRoleId()));
            role.setParentRole(parentRole);
        } else {
            role.setParentRole(null);
        }

        // ===== 4. ตรวจสอบ Role Code ซ้ำ =====
        if (request.getId() == null) {
            // เพิ่มใหม่
            if (businessRoleRepository.existsByBusinessIdAndRoleCodeAndIsDeleteFalse(
                    request.getBusinessId(), request.getRoleCode())) {
                throw new RuntimeException("Role code '" + request.getRoleCode() + "' already exists in this business.");
            }
        } else {
            // แก้ไข: ต้องไม่ใช่ตัวเอง
            Optional<SuBusinessRole> existing = businessRoleRepository
                    .findByBusinessIdAndRoleCodeAndIsDeleteFalse(request.getBusinessId(), request.getRoleCode());
            if (existing.isPresent() && !existing.get().getId().equals(request.getId())) {
                throw new RuntimeException("Role code '" + request.getRoleCode() + "' already exists in this business.");
            }
        }

        // ===== 5. ตั้งค่าฟิลด์อื่น ๆ =====
        role.setRoleCode(request.getRoleCode());
        role.setRoleNameEn(request.getRoleNameEn());
        role.setRoleNameLocal(request.getRoleNameLocal());
        role.setRoleLevel(request.getRoleLevel());
        role.setSortOrder(request.getSortOrder());
        role.setIsActive(request.isActive());
        role.setColor(request.getColor());

        // ===== 6. บันทึก =====
        businessRoleRepository.save(role);

        // ===== 7. เคลียร์ Cache =====
        programAccessService.removeAllAccessCache();

        return ResponseEntity.ok(role.getId());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete business role")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        SuBusinessRole role = businessRoleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business role not found"));

        // ===== Soft Delete =====
        role.setIsDelete(true);
        role.setIsActive(false);
        String currentUser = currentUserService.getUserId();
        role.setDeleteBy(currentUser);
        role.setDeleteDate(Instant.now());

        businessRoleRepository.save(role);

        // ===== เคลียร์ Cache =====
        programAccessService.removeAllAccessCache();

        return ResponseEntity.noContent().build();
    }

    // ===== Helper: toResponse =====
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
        response.setColor(role.getColor()); 
        return response;
    }
}