// src/main/java/com/softinter/sicapi/controller/su/SuProgramController.java

package com.softinter.sicapi.controller.su;

import com.softinter.sicapi.dto.request.CreateProgramWithPermissionsRequest;
import com.softinter.sicapi.dto.request.DeleteRequest;
import com.softinter.sicapi.dto.request.ProgramPageRequest;
import com.softinter.sicapi.dto.request.SaveProgramRequest;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.dto.response.ProgramResponse;
import com.softinter.sicapi.entity.su.SuProgram;
import com.softinter.sicapi.entity.su.SuBusinessRole;
import com.softinter.sicapi.entity.su.SuBusinessRoleProgram;
import com.softinter.sicapi.repository.su.SuProgramRepository;
import com.softinter.sicapi.repository.su.SuBusinessRoleRepository;
import com.softinter.sicapi.repository.su.SuBusinessRoleProgramRepository;
import com.softinter.sicapi.service.ProgramAccessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/su/programs")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Program", description = "Program Management API")
public class SuProgramController {

    private final SuProgramRepository programRepository;
    private final SuBusinessRoleRepository businessRoleRepository;
    private final SuBusinessRoleProgramRepository businessRoleProgramRepository;
    private final ProgramAccessService programAccessService;

    @GetMapping
    @Operation(summary = "Get all programs")
    public ResponseEntity<List<ProgramResponse>> getAll() {
        List<ProgramResponse> programs = programRepository.findAllActive()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(programs);
    }

    @GetMapping("/paging")
    @Operation(summary = "Get programs with pagination")
    public ResponseEntity<PaginationResponse<ProgramResponse>> paging(
            @Valid @ModelAttribute ProgramPageRequest request) {
        Pageable pageable = PageRequest.of(
                request.getPageNumber() - 1,
                request.getPageSize(),
                Sort.by("sortOrder").ascending());

        Specification<SuProgram> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("isDelete"), false));
            if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
                String keyword = "%" + request.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("programCode")), keyword),
                        cb.like(cb.lower(root.get("nameEn")), keyword),
                        cb.like(cb.lower(root.get("nameLocal")), keyword)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<SuProgram> page = programRepository.findAll(spec, pageable);
        List<ProgramResponse> data = page.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        PaginationResponse<ProgramResponse> response = new PaginationResponse<>();
        response.setData(data);
        com.softinter.sicapi.dto.Pageable pageableDto = new com.softinter.sicapi.dto.Pageable();
        pageableDto.setPageNumber(request.getPageNumber());
        pageableDto.setPageSize(request.getPageSize());
        pageableDto.setTotalElements(page.getTotalElements());
        pageableDto.calculateTotalPages();
        response.setPageable(pageableDto);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/tree")
    @Operation(summary = "Get program tree (for UI)")
    public ResponseEntity<List<ProgramResponse>> getTree() {
        List<SuProgram> all = programRepository.findByIsActiveTrueAndIsDeleteFalseOrderBySortOrder();
        return ResponseEntity.ok(all.stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get program by ID")
    public ResponseEntity<ProgramResponse> getById(@PathVariable UUID id) {
        SuProgram program = programRepository.findByIdWithParent(id)
                .orElseThrow(() -> new RuntimeException("Program not found"));
        return ResponseEntity.ok(toResponse(program));
    }

    @PostMapping("/save")
    @Operation(summary = "Save program")
    @Transactional
    public ResponseEntity<UUID> save(@Valid @RequestBody SaveProgramRequest request) {
        SuProgram program;
        if (request.getId() != null) {
            program = programRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("Program not found"));
        } else {
            if (programRepository.existsByProgramCodeAndIsDeleteFalse(request.getProgramCode())) {
                throw new RuntimeException("Program code already exists: " + request.getProgramCode());
            }
            program = new SuProgram();
        }

        program.setProgramCode(request.getProgramCode());
        program.setNameEn(request.getProgramNameEn());
        program.setNameLocal(request.getProgramNameLocal());
        program.setIcon(request.getProgramIcon());
        program.setRoutePath(request.getRoutePath());
        program.setSortOrder(request.getSortOrder());
        program.setIsActive(request.isActive());

        if (request.getParentProgramId() != null) {
            SuProgram parent = programRepository.findById(request.getParentProgramId())
                    .orElseThrow(() -> new RuntimeException("Parent program not found"));
            program.setParentProgram(parent);
        } else {
            program.setParentProgram(null);
        }

        if (request.getRowVersion() != null) {
            program.setRowVersion(request.getRowVersion());
        }

        programRepository.save(program);
        return ResponseEntity.ok(program.getId());
    }

    @PostMapping("/create-with-permissions")
    @Operation(summary = "Create program with initial permissions")
    @Transactional
    public ResponseEntity<UUID> createWithPermissions(@RequestBody CreateProgramWithPermissionsRequest request) {
        if (programRepository.existsByProgramCodeAndIsDeleteFalse(request.getProgramCode())) {
            throw new RuntimeException("Program code already exists: " + request.getProgramCode());
        }

        SuProgram program = new SuProgram();
        program.setProgramCode(request.getProgramCode());
        program.setNameEn(request.getProgramNameEn());
        program.setNameLocal(request.getProgramNameLocal());
        program.setIcon(request.getProgramIcon());
        program.setRoutePath(request.getRoutePath());
        program.setSortOrder(request.getSortOrder());
        program.setIsActive(request.isActive());

        if (request.getParentProgramId() != null) {
            SuProgram parent = programRepository.findById(request.getParentProgramId())
                    .orElseThrow(() -> new RuntimeException("Parent program not found"));
            program.setParentProgram(parent);
        }

        program = programRepository.save(program);

        if (request.getRolePermissions() != null && !request.getRolePermissions().isEmpty()) {
            for (CreateProgramWithPermissionsRequest.RolePermissionDto permDto : request.getRolePermissions()) {
                SuBusinessRole role = businessRoleRepository.findById(permDto.getRoleId())
                        .orElseThrow(() -> new RuntimeException("Role not found: " + permDto.getRoleId()));

                boolean[] flags = mapLevelToBooleans(permDto.getLevel());

                SuBusinessRoleProgram brp = new SuBusinessRoleProgram();
                brp.setBusinessRole(role);
                brp.setProgram(program);
                brp.setIsActive(!"None".equals(permDto.getLevel()));
                brp.setAdd(flags[0]);
                brp.setSave(flags[1]);
                brp.setRemove(flags[2]);
                brp.setPrint(flags[3]);
                brp.setBack(flags[4]);
                brp.setSearch(flags[5]);

                businessRoleProgramRepository.save(brp);
            }
        }

        programAccessService.removeAllAccessCache();

        return ResponseEntity.ok(program.getId());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete program (soft delete)")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable UUID id, @RequestBody(required = false) DeleteRequest request) {
        SuProgram program = programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found"));

        List<SuProgram> children = programRepository.findByParentProgramIdAndIsDeleteFalse(id);
        if (!children.isEmpty()) {
            throw new RuntimeException("Cannot delete program that has child programs. Please delete child programs first.");
        }

        List<SuBusinessRoleProgram> usages = businessRoleProgramRepository.findByProgramIdAndIsDeleteFalse(id);
        if (!usages.isEmpty()) {
            for (SuBusinessRoleProgram brp : usages) {
                brp.setIsDelete(true);
                brp.setIsActive(false);
                businessRoleProgramRepository.save(brp);
            }
        }

        program.setIsDelete(true);
        program.setIsActive(false);
        programRepository.save(program);

        programAccessService.removeAllAccessCache();

        return ResponseEntity.noContent().build();
    }

    private ProgramResponse toResponse(SuProgram program) {
        ProgramResponse response = new ProgramResponse();
        response.setId(program.getId());
        if (program.getParentProgram() != null) {
            response.setParentProgramId(program.getParentProgram().getId());
            response.setParentProgramCode(program.getParentProgram().getProgramCode());
        }
        response.setProgramCode(program.getProgramCode());
        response.setProgramNameEn(program.getNameEn());
        response.setProgramNameLocal(program.getNameLocal());
        response.setProgramIcon(program.getIcon());
        response.setRoutePath(program.getRoutePath());
        response.setSortOrder(program.getSortOrder());
        response.setActive(Boolean.TRUE.equals(program.getIsActive()));
        response.setRowVersion(program.getRowVersion());
        return response;
    }

    private boolean[] mapLevelToBooleans(String level) {
        switch (level) {
            case "Full":
                return new boolean[]{true, true, true, true, true, true};
            case "Edit":
                return new boolean[]{true, true, false, false, true, true};
            case "Approve":
                return new boolean[]{false, true, false, false, true, true};
            case "View":
                return new boolean[]{false, false, false, false, true, true};
            case "None":
            default:
                return new boolean[]{false, false, false, false, false, false};
        }
    }
}