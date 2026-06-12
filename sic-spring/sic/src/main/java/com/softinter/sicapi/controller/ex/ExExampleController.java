package com.softinter.sicapi.controller.ex;

import com.softinter.sicapi.dto.request.*;
import com.softinter.sicapi.dto.response.*;
import com.softinter.sicapi.entity.ex.ExExample;
import com.softinter.sicapi.repository.ex.ExExampleRepository;
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
@RequestMapping("/api/ex/examples")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Example", description = "Example CRUD API")
public class ExExampleController {

    private final ExExampleRepository exampleRepository;

    @GetMapping
    @Operation(summary = "Get all examples")
    public ResponseEntity<List<ExExample>> getAll() {
        List<ExExample> examples = exampleRepository.findByIsDeleteFalse();
        return ResponseEntity.ok(examples);
    }

    @GetMapping("/paging")
    @Operation(summary = "Get examples with pagination")
    public ResponseEntity<PaginationResponse<ExExample>> paging(
            @Valid @ModelAttribute ExamplePageRequest request) {
        
        Pageable pageable = PageRequest.of(
                request.getPageNumber() - 1,
                request.getPageSize(),
                Sort.by("createdDate").descending());

        Specification<ExExample> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("isDelete"), false));
            if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
                String keyword = "%" + request.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("exampleCode")), keyword),
                        cb.like(cb.lower(root.get("messageEn")), keyword)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ExExample> page = exampleRepository.findAll(spec, pageable);

        PaginationResponse<ExExample> response = new PaginationResponse<>();
        response.setData(page.getContent());
        
        com.softinter.sicapi.dto.Pageable pageableDto = new com.softinter.sicapi.dto.Pageable();
        pageableDto.setPageNumber(request.getPageNumber());
        pageableDto.setPageSize(request.getPageSize());
        pageableDto.setTotalElements(page.getTotalElements());
        pageableDto.calculateTotalPages();
        response.setPageable(pageableDto);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/lov")
    @Operation(summary = "Get example LOV")
    public ResponseEntity<List<LovResponse>> lov() {
        List<LovResponse> lov = exampleRepository.findByIsDeleteFalse()
                .stream()
                .map(e -> new LovResponse(e.getId(), e.getExampleCode()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(lov);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get example by ID")
    public ResponseEntity<ExExample> getById(@PathVariable UUID id) {
        ExExample example = exampleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Example not found"));
        return ResponseEntity.ok(example);
    }

    @PostMapping("/save")
    @Operation(summary = "Save example")
    public ResponseEntity<UUID> save(@RequestBody ExExample request) {
        ExExample example;
        if (request.getId() != null) {
            example = exampleRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("Example not found"));
        } else {
            example = new ExExample();
        }
        example.setExampleCode(request.getExampleCode());
        example.setMessageEn(request.getMessageEn());
        example.setMessageLocal(request.getMessageLocal());
        example.setStartDate(request.getStartDate());
        example.setEndDate(request.getEndDate());
        example.setStartTime(request.getStartTime());
        example.setEndTime(request.getEndTime());
        example.setIsAccept(request.getIsAccept());
        example.setColor(request.getColor());
        example.setCountryCode(request.getCountryCode());
        example.setTotal(request.getTotal());
        example.setUploadGroupId(request.getUploadGroupId());
        example.setIsActive(request.getIsActive());
        exampleRepository.save(example);
        return ResponseEntity.ok(example.getId());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete example")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        ExExample example = exampleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Example not found"));
        example.setIsDelete(true);
        example.setIsActive(false);
        exampleRepository.save(example);
        return ResponseEntity.ok().build();
    }
}