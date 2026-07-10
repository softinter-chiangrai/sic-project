package com.softinter.sicapi.controller.pm;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmRequirementRequest;
import com.softinter.sicapi.dto.response.ComboboxResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.dto.response.PmRequirementResponse;
import com.softinter.sicapi.entity.db.DbParameter;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.repository.db.DbParameterRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmRequirementService;
import com.softinter.sicapi.util.LocalizationHelper;
import com.softinter.sicapi.util.PaginationUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/requirement")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Requirement", description = "Requirement Management API")
public class PmRequirementController {

    private final PmRequirementService requirementService;
    private final PmCustomerProjectRepository projectRepository;
    private final DbParameterRepository parameterRepository;
    private final CurrentUserService currentUserService;

    @GetMapping
    @Operation(summary = "Get requirements with pagination and filters")
    public ResponseEntity<PaginationResponse<PmRequirementResponse>> getRequirements(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) UUID projectId,   
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "requirementCode") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDir) {

    UUID businessId = BusinessContextHolder.getBusinessId();
    if (businessId == null) {
        return ResponseEntity.badRequest().build();
    }

    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));
    Page<PmRequirementResponse> pageResult = requirementService.findAll(businessId, projectId, keyword, status, pageable);
        PaginationResponse<PmRequirementResponse> response = PaginationUtil.of(
                pageResult.getContent(),
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get requirement by ID")
    public ResponseEntity<PmRequirementResponse> getRequirement(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(requirementService.findById(id, businessId));
    }

    @PostMapping("/save")
    @Operation(summary = "Save requirement (create or update)")
    public ResponseEntity<UUID> save(@RequestBody PmRequirementRequest request) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = currentUserService.getUserId();
        UUID id = requirementService.save(request, businessId, userId);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete requirement (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = currentUserService.getUserId();
        requirementService.delete(id, businessId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/combobox-project")
    @Operation(summary = "Get project combobox list")
    public ResponseEntity<List<ComboboxResponse>> getComboboxProjects() {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        List<PmCustomerProject> projects = projectRepository.findByBusinessIdAndIsDeleteFalse(businessId);
        List<ComboboxResponse> list = projects.stream()
                .map(p -> new ComboboxResponse(p.getId().toString(), p.getProjectName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/lov-type")
    @Operation(summary = "Get requirement type LOV")
    public ResponseEntity<List<ComboboxResponse>> getLovType() {
        return getParameterLov("PM", "REQ_TYPE");
    }

    @GetMapping("/lov-priority")
    @Operation(summary = "Get requirement priority LOV")
    public ResponseEntity<List<ComboboxResponse>> getLovPriority() {
        return getParameterLov("COMMON", "PRIORITY");
    }

    @GetMapping("/lov-status")
    @Operation(summary = "Get requirement status LOV")
    public ResponseEntity<List<ComboboxResponse>> getLovStatus() {
        return getParameterLov("COMMON", "DOC_STATUS");
    }

    @GetMapping("/lov-business-value")
    @Operation(summary = "Get business value LOV")
    public ResponseEntity<List<ComboboxResponse>> getLovBusinessValue() {
        return getParameterLov("PM", "BUSINESS_VALUE");  
    }

    private ResponseEntity<List<ComboboxResponse>> getParameterLov(String moduleCode, String parameterCode) {
        List<DbParameter> params = parameterRepository.findByModuleCodeAndParameterCodeAndIsActiveTrueOrderBySortOrder(moduleCode, parameterCode);
        List<ComboboxResponse> list = params.stream()
                .map(p -> new ComboboxResponse(p.getParameterValue(), LocalizationHelper.getParameterName(p)))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }
}