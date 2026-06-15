package com.softinter.sicapi.controller.su;

import com.softinter.sicapi.dto.request.*;
import com.softinter.sicapi.dto.response.*;
import com.softinter.sicapi.entity.su.SuUserBusiness;
import com.softinter.sicapi.repository.su.SuUserBusinessRepository;
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
@RequestMapping("/api/su/user-businesses")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "User Business", description = "User Business Management API")
public class SuUserBusinessController {

    private final SuUserBusinessRepository userBusinessRepository;

    @GetMapping
    @Operation(summary = "Get all user businesses")
    public ResponseEntity<List<UserBusinessResponse>> getAll(
            @RequestParam(required = false) String userId) {
        List<SuUserBusiness> list;
        if (userId != null) {
            list = userBusinessRepository.findByUserIdAndIsActiveTrue(userId);
        } else {
            list = userBusinessRepository.findAll();
        }
        List<UserBusinessResponse> response = list.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/paging")
    @Operation(summary = "Get user businesses with pagination")
    public ResponseEntity<PaginationResponse<UserBusinessResponse>> paging(
            @Valid @ModelAttribute UserBusinessPageRequest request) {
        Pageable pageable = PageRequest.of(request.getPageNumber() - 1, request.getPageSize());

        Specification<SuUserBusiness> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("isDelete"), false));
            if (request.getUserId() != null) {
                predicates.add(cb.equal(root.get("userId"), request.getUserId()));
            }
            if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
                String keyword = "%" + request.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("userId")), keyword)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<SuUserBusiness> page = userBusinessRepository.findAll(spec, pageable);
        List<UserBusinessResponse> data = page.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        PaginationResponse<UserBusinessResponse> response = new PaginationResponse<>();
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
    @Operation(summary = "Get user business LOV")
    public ResponseEntity<List<LovResponse>> lov(@RequestParam String userId) {
        List<LovResponse> lov = userBusinessRepository.findByUserIdAndIsActiveTrue(userId)
                .stream()
                .map(ub -> new LovResponse(ub.getId(), ub.getUserId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(lov);
    }

    @PostMapping("/save")
    @Operation(summary = "Save user business")
    public ResponseEntity<UUID> save(@Valid @RequestBody SaveUserBusinessRequest request) {
        SuUserBusiness ub;
        if (request.getId() != null) {
            ub = userBusinessRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("User business not found"));
        } else {
            ub = new SuUserBusiness();
        }
        ub.setUserId(request.getUserId());
        ub.setIsActive(request.isActive());
        ub.setIsDefault(request.isDefault());
        // หมายเหตุ: ยังไม่ได้ set businessId หรือ relation ถ้ามี ควรเพิ่ม
        userBusinessRepository.save(ub);
        return ResponseEntity.ok(ub.getId());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user business")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        SuUserBusiness ub = userBusinessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User business not found"));
        ub.setIsDelete(true);
        ub.setIsActive(false);
        userBusinessRepository.save(ub);
        return ResponseEntity.noContent().build();
    }

    private UserBusinessResponse toResponse(SuUserBusiness ub) {
        UserBusinessResponse response = new UserBusinessResponse();
        response.setId(ub.getId());
        response.setUserId(ub.getUserId());
        if (ub.getBusiness() != null) {
            response.setBusinessId(ub.getBusiness().getId());
            response.setBusinessCode(ub.getBusiness().getBusinessCode());
        }
        response.setActive(Boolean.TRUE.equals(ub.getIsActive()));
        response.setDefault(Boolean.TRUE.equals(ub.getIsDefault()));
        response.setRowVersion(ub.getRowVersion());
        return response;
    }
}