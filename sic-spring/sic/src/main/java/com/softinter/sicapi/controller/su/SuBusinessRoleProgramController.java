package com.softinter.sicapi.controller.su;

import com.softinter.sicapi.dto.request.*;
import com.softinter.sicapi.dto.response.*;
import com.softinter.sicapi.entity.su.SuBusinessRoleProgram;
import com.softinter.sicapi.entity.su.SuBusinessRole;
import com.softinter.sicapi.entity.su.SuProgram;
import com.softinter.sicapi.repository.su.SuBusinessRoleProgramRepository;
import com.softinter.sicapi.repository.su.SuBusinessRoleRepository;
import com.softinter.sicapi.repository.su.SuProgramRepository;
import com.softinter.sicapi.util.LocalizationHelper;

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
    private final SuBusinessRoleRepository businessRoleRepository;
    private final SuProgramRepository programRepository;

     @GetMapping
    @Operation(summary = "Get all business role programs")
    public ResponseEntity<List<BusinessRoleProgramResponse>> getAll(
            @RequestParam(required = false) UUID businessRoleId) {
        // ใช้เมธอดใหม่ที่ JOIN FETCH ข้อมูล businessRole และ program
        List<SuBusinessRoleProgram> list = brpRepository.findAllWithFetch(businessRoleId);
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
            if (request.getBusinessRoleId() != null) {
                SuBusinessRole role = businessRoleRepository.findById(request.getBusinessRoleId())
                        .orElseThrow(() -> new RuntimeException("Business role not found"));
                brp.setBusinessRole(role);
            }
            if (request.getProgramId() != null) {
                SuProgram program = programRepository.findById(request.getProgramId())
                        .orElseThrow(() -> new RuntimeException("Program not found"));
                brp.setProgram(program);
            }
        }
        brp.setIsActive(request.isActive());
        brp.setAdd(request.isAdd());
        brp.setBack(request.isBack());
        brp.setPrint(request.isPrint());
        brp.setRemove(request.isRemove());
        brp.setSave(request.isSave());
        brp.setSearch(request.isSearch());
        if (request.getRowVersion() != null) {
            brp.setRowVersion(request.getRowVersion());
        }
        brpRepository.save(brp);
        return ResponseEntity.ok(brp.getId());
    }

    @PostMapping("/bulk-save")
    @Operation(summary = "Save all program permissions for a role")
    public ResponseEntity<Void> bulkSave(@Valid @RequestBody SaveRolePermissionsRequest request) {
        SuBusinessRole role = null;
        if (request.getRoleId() != null) {
            role = businessRoleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Business role not found"));
        }

        for (SaveBusinessRoleProgramRequest req : request.getModules()) {
            SuBusinessRoleProgram brp;
            if (req.getId() != null) {
                brp = brpRepository.findById(req.getId())
                        .orElseThrow(() -> new RuntimeException("Business role program not found"));
            } else {
                UUID bRoleId = req.getBusinessRoleId() != null ? req.getBusinessRoleId() : (role != null ? role.getId() : null);
                if (bRoleId == null) {
                    throw new RuntimeException("Business role ID must not be null");
                }
                List<SuBusinessRoleProgram> existing = brpRepository.findByBusinessRoleIdAndIsDeleteFalse(bRoleId);
                brp = existing.stream()
                        .filter(x -> x.getProgram().getId().equals(req.getProgramId()))
                        .findFirst()
                        .orElse(null);
                
                if (brp == null) {
                    brp = new SuBusinessRoleProgram();
                    SuBusinessRole moduleRole = businessRoleRepository.findById(bRoleId)
                            .orElseThrow(() -> new RuntimeException("Business role not found"));
                    brp.setBusinessRole(moduleRole);
                    SuProgram program = programRepository.findById(req.getProgramId())
                            .orElseThrow(() -> new RuntimeException("Program not found"));
                    brp.setProgram(program);
                }
            }
            brp.setIsActive(req.isActive());
            brp.setAdd(req.isAdd());
            brp.setBack(req.isBack());
            brp.setPrint(req.isPrint());
            brp.setRemove(req.isRemove());
            brp.setSave(req.isSave());
            brp.setSearch(req.isSearch());
            if (req.getRowVersion() != null) {
                brp.setRowVersion(req.getRowVersion());
            }
            brpRepository.save(brp);
        }
        return ResponseEntity.ok().build();
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
        // ✅ เพิ่ม
        response.setProgramName(LocalizationHelper.getProgramName(brp.getProgram()));
    }
    response.setActive(Boolean.TRUE.equals(brp.getIsActive()));
    response.setAdd(brp.isAdd());
    response.setBack(brp.isBack());
    response.setPrint(brp.isPrint());
    response.setRemove(brp.isRemove());
    response.setSave(brp.isSave());
    response.setSearch(brp.isSearch());
    response.setRowVersion(brp.getRowVersion());
    return response;
}
}