package com.softinter.sicapi.controller.su;

import com.softinter.sicapi.dto.request.*;
import com.softinter.sicapi.dto.response.*;
import com.softinter.sicapi.entity.su.SuProgram;
import com.softinter.sicapi.repository.su.SuProgramRepository;
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
@RequestMapping("/api/su/programs")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Program", description = "Program Management API")
public class SuProgramController {

    private final SuProgramRepository programRepository;

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

    @GetMapping("/lov")
    @Operation(summary = "Get program LOV")
    public ResponseEntity<List<LovResponse>> lov() {
        List<LovResponse> lov = programRepository.findAllActive()
                .stream()
                .map(p -> new LovResponse(p.getId(), p.getNameEn()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(lov);
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
    public ResponseEntity<UUID> save(@Valid @RequestBody SaveProgramRequest request) {
        SuProgram program;
        if (request.getId() != null) {
            program = programRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("Program not found"));
        } else {
            program = new SuProgram();
        }
        // แก้ไขการ set ให้ถูกต้องตามฟิลด์ใน SaveProgramRequest
        program.setProgramCode(request.getProgramCode());
        program.setNameEn(request.getProgramNameEn());
        program.setNameLocal(request.getProgramNameLocal());
        program.setIcon(request.getProgramIcon());
        program.setSortOrder(request.getSortOrder());
        program.setIsActive(request.isActive());
        // หมายเหตุ: หาก entity ไม่มีฟิลด์ programType/programPath ให้ปรับตามความเหมาะสม
        programRepository.save(program);
        return ResponseEntity.ok(program.getId());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete program")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @RequestBody DeleteRequest request) {
        SuProgram program = programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found"));
        program.setIsDelete(true);
        program.setIsActive(false);
        programRepository.save(program);
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
        response.setSortOrder(program.getSortOrder());
        response.setActive(Boolean.TRUE.equals(program.getIsActive()));
        response.setRowVersion(program.getRowVersion());
        return response;
    }
}