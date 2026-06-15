package com.softinter.sicapi.controller.su;

import com.softinter.sicapi.dto.request.*;
import com.softinter.sicapi.dto.response.*;
import com.softinter.sicapi.entity.su.SuBusinessRoleProgram;
import com.softinter.sicapi.repository.su.SuBusinessRoleProgramRepository;
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
@RequestMapping("/api/su/business-role-programs")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Business Role Program", description = "Business Role Program Management API")
public class SuBusinessRoleProgramController {

    private final SuBusinessRoleProgramRepository brpRepository;

    @GetMapping
    @Operation(summary = "Get all business role programs")
    public ResponseEntity<List<BusinessRoleProgramResponse>> getAll(
            @RequestParam(required = false) UUID businessRoleId) {
        List<SuBusinessRoleProgram> list;
        if (businessRoleId != null) {
            list = brpRepository.findByBusinessRoleIdAndIsDeleteFalse(businessRoleId);
        } else {
            list = brpRepository.findAll();
        }
        List<BusinessRoleProgramResponse> response = list.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/paging")
    @Operation(summary = "Get business role programs with pagination")
    public ResponseEntity<PaginationResponse<BusinessRoleProgramResponse>> paging(
            @Valid @ModelAttribute BusinessRoleProgramPageRequest request) {
        Pageable pageable = PageRequest.of(
                request.getPageNumber() - 1,
                request.getPageSize());

        Specification<SuBusinessRoleProgram> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("isDelete"), false));
            if (request.getBusinessRoleId() != null) {
                predicates.add(cb.equal(root.get("businessRole").get("id"), request.getBusinessRoleId()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<SuBusinessRoleProgram> page = brpRepository.findAll(spec, pageable);
        List<BusinessRoleProgramResponse> data = page.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        PaginationResponse<BusinessRoleProgramResponse> response = new PaginationResponse<>();
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
    @Operation(summary = "Get business role program LOV")
    public ResponseEntity<List<LovResponse>> lov(@RequestParam UUID businessRoleId) {
        List<LovResponse> lov = brpRepository.findActiveByBusinessRoleId(businessRoleId)
                .stream()
                .map(brp -> new LovResponse(brp.getProgram().getId(), brp.getProgram().getNameEn()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(lov);
    }

    @PostMapping("/save")
    @Operation(summary = "Save business role program")
    public ResponseEntity<UUID> save(@Valid @RequestBody SaveBusinessRoleProgramRequest request) {
        SuBusinessRoleProgram brp;
        if (request.getId() != null) {
            brp = brpRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("Business role program not found"));
        } else {
            brp = new SuBusinessRoleProgram();
        }
        brp.setIsActive(request.isActive());
        brpRepository.save(brp);
        return ResponseEntity.ok(brp.getId());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete business role program")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @RequestBody DeleteRequest request) {
        SuBusinessRoleProgram brp = brpRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business role program not found"));
        brp.setIsDelete(true);
        brp.setIsActive(false);
        brpRepository.save(brp);
        return ResponseEntity.noContent().build();
    }

    private BusinessRoleProgramResponse toResponse(SuBusinessRoleProgram brp) {
        BusinessRoleProgramResponse response = new BusinessRoleProgramResponse();
        response.setId(brp.getId());
        if (brp.getBusinessRole() != null) {
            response.setBusinessRoleId(brp.getBusinessRole().getId());
            response.setBusinessRoleCode(brp.getBusinessRole().getRoleCode());
        }
        if (brp.getProgram() != null) {
            response.setProgramId(brp.getProgram().getId());
            response.setProgramCode(brp.getProgram().getProgramCode());
            response.setProgramNameEn(brp.getProgram().getNameEn());
            response.setProgramNameLocal(brp.getProgram().getNameLocal());
        }
        response.setActive(Boolean.TRUE.equals(brp.getIsActive()));
        response.setRowVersion(brp.getRowVersion());
        return response;
    }
}