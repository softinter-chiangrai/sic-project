package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmSpecificationRequest;
import com.softinter.sicapi.dto.response.ComboboxResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.dto.response.PmSpecificationResponse;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.entity.pm.PmSpecification;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationRepository;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmSpecificationService;
import com.softinter.sicapi.util.PaginationUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pm/specification")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Specification", description = "Specification Management API")
public class PmSpecificationController {

    private final PmSpecificationService specService;
    private final CurrentUserService currentUserService;
    private final PmRequirementRepository requirementRepository;
    private final PmSpecificationRepository specRepository;

    @GetMapping("/paging")
    @Operation(summary = "Get specifications with pagination")
    public ResponseEntity<PaginationResponse<PmSpecificationResponse>> getPaging(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        Page<PmSpecificationResponse> pageResult = specService.findAll(businessId, projectId, keyword, pageable);
        return ResponseEntity.ok(PaginationUtil.of(pageResult.getContent(), page, size, pageResult.getTotalElements()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specification by ID")
    public ResponseEntity<PmSpecificationResponse> getById(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        return ResponseEntity.ok(specService.findById(id, businessId));
    }

    @PostMapping("/save")
    @Operation(summary = "Save specification")
    public ResponseEntity<UUID> save(@Valid @RequestBody PmSpecificationRequest request) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();
        return ResponseEntity.ok(specService.save(request, businessId, userId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete specification")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();
        specService.delete(id, businessId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/combobox-requirement")
    @Operation(summary = "Get requirements for combobox")
    public ResponseEntity<List<ComboboxResponse>> getComboboxRequirements(
            @RequestParam(required = false) UUID projectId
    ) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        List<PmRequirement> requirements;
        if (projectId != null) {
            requirements = requirementRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(businessId, projectId);
        } else {
            requirements = requirementRepository.findByBusinessIdAndIsDeleteFalse(businessId);
        }
        List<ComboboxResponse> response = requirements.stream()
                .map(r -> new ComboboxResponse(r.getId().toString(), r.getTitle()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/combobox-diagram")
    @Operation(summary = "Get diagrams for combobox")
    public ResponseEntity<List<ComboboxResponse>> getComboboxDiagrams(
            @RequestParam UUID projectId,
            @RequestParam(required = false) String type
    ) {
        // ดึง diagram จาก pm_diagram (ต้องมี repository ของ pm_diagram)
        // สมมติว่ามี DiagramRepository
        // แต่เราไม่มี DiagramRepository ในที่นี้ เราจะใช้ service อื่น หรือส่งค่าว่าง
        // TODO: implement using DiagramService
        return ResponseEntity.ok(List.of());
    }
}