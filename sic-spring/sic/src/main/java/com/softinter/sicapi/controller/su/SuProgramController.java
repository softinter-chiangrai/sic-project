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
    public ResponseEntity<ApiResponse<List<ProgramResponse>>> getAll() {
        List<ProgramResponse> programs = programRepository.findAllActive()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(programs));
    }

    @GetMapping("/paging")
    @Operation(summary = "Get programs with pagination")
    public ResponseEntity<ApiResponse<PaginationResponse<ProgramResponse>>> paging(
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
                        cb.like(cb.lower(root.get("programNameEn")), keyword),
                        cb.like(cb.lower(root.get("programNameLocal")), keyword)
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

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/lov")
    @Operation(summary = "Get program LOV")
    public ResponseEntity<ApiResponse<List<LovResponse>>> lov() {
        List<LovResponse> lov = programRepository.findAllActive()
                .stream()
                .map(p -> new LovResponse(p.getId(), p.getProgramNameEn()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(lov));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get program by ID")
    public ResponseEntity<ApiResponse<ProgramResponse>> getById(@PathVariable UUID id) {
        SuProgram program = programRepository.findByIdWithParent(id)
                .orElseThrow(() -> new RuntimeException("Program not found"));
        return ResponseEntity.ok(ApiResponse.success(toResponse(program)));
    }

    @PostMapping("/save")
    @Operation(summary = "Save program")
    public ResponseEntity<ApiResponse<UUID>> save(@Valid @RequestBody SaveProgramRequest request) {
        SuProgram program;
        if (request.getId() != null) {
            program = programRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("Program not found"));
        } else {
            program = new SuProgram();
        }
        program.setProgramCode(request.getProgramCode());
        program.setProgramNameEn(request.getProgramNameEn());
        program.setProgramNameLocal(request.getProgramNameLocal());
        program.setProgramType(request.getProgramType());
        program.setProgramPath(request.getProgramPath());
        program.setProgramIcon(request.getProgramIcon());
        program.setSortOrder(request.getSortOrder());
        program.setIsActive(request.isActive());
        programRepository.save(program);
        return ResponseEntity.ok(ApiResponse.success(program.getId()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete program")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id, @RequestBody DeleteRequest request) {
        SuProgram program = programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found"));
        program.setIsDelete(true);
        program.setIsActive(false);
        programRepository.save(program);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private ProgramResponse toResponse(SuProgram program) {
        ProgramResponse response = new ProgramResponse();
        response.setId(program.getId());
        if (program.getParentProgram() != null) {
            response.setParentProgramId(program.getParentProgram().getId());
            response.setParentProgramCode(program.getParentProgram().getProgramCode());
        }
        response.setProgramCode(program.getProgramCode());
        response.setProgramNameEn(program.getProgramNameEn());
        response.setProgramNameLocal(program.getProgramNameLocal());
        response.setProgramType(program.getProgramType());
        response.setProgramPath(program.getProgramPath());
        response.setProgramIcon(program.getProgramIcon());
        response.setSortOrder(program.getSortOrder());
        response.setActive(Boolean.TRUE.equals(program.getIsActive()));
        response.setRowVersion(program.getRowVersion());
        return response;
    }
}
