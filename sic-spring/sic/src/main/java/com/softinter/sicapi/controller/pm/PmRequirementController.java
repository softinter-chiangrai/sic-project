package com.softinter.sicapi.controller.pm;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.repository.db.DbParameterRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.service.ApprovalService;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmRequirementExportService;
import com.softinter.sicapi.service.PmRequirementService;
import com.softinter.sicapi.util.LocalizationHelper;
import com.softinter.sicapi.util.PaginationUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pm/requirement")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Requirement", description = "Requirement Management API")
public class PmRequirementController {

    private final PmRequirementService requirementService;
    private final PmRequirementExportService requirementExportService;
    private final PmCustomerProjectRepository projectRepository;
    private final DbParameterRepository parameterRepository;
    private final CurrentUserService currentUserService;
    private final PmRequirementRepository requirementRepository;
    private final ApprovalService approvalService;

    @GetMapping
    @Operation(summary = "Get requirements with pagination and filters")
    public ResponseEntity<PaginationResponse<PmRequirementResponse>> getRequirements(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) UUID projectId,   
        @PageableDefault(size = 10, sort = "requirementCode", direction = Sort.Direction.ASC) Pageable pageable) {

        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }

        Page<PmRequirementResponse> pageResult = requirementService.findAll(businessId, projectId, keyword, status, pageable);
        PaginationResponse<PmRequirementResponse> response = PaginationUtil.of(
                pageResult.getContent(),
                pageable.getPageNumber(),
                pageable.getPageSize(),
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

    @PostMapping("/{id}/create-revision")
    @Operation(summary = "Create a new draft revision from an approved requirement")
    public ResponseEntity<PmRequirementResponse> createRevision(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        approvalService.createRevision("REQUIREMENT", id, "สร้าง Revision ใหม่จากเอกสารที่อนุมัติแล้ว");
        return ResponseEntity.ok(requirementService.findById(id, businessId));
    }

    @PostMapping("/save")
    @Operation(summary = "Save requirement (create or update)")
    public ResponseEntity<PmRequirementResponse> save(@RequestBody PmRequirementRequest request) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = currentUserService.getUserId();
        PmRequirementResponse response = requirementService.save(request, businessId, userId);
        return ResponseEntity.ok(response);
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
        return getParameterLov("PM", "REQUIREMENT_TYPE");
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

    @GetMapping("/combobox")
    @Operation(summary = "Get requirement combobox list")
    public ResponseEntity<List<ComboboxResponse>> getComboboxRequirements(
            @RequestParam(required = false) UUID projectId) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        List<PmRequirement> requirements;
        if (projectId != null) {
            requirements = requirementRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(businessId, projectId);
        } else {
            requirements = requirementRepository.findByBusinessIdAndIsDeleteFalse(businessId);
        }
        List<ComboboxResponse> list = requirements.stream()
                .map(r -> new ComboboxResponse(r.getId().toString(), r.getTitle()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // ================================================================
    // Export
    // ================================================================

    /**
     * Export requirement document as PDF.
     * GET /api/pm/requirement/{id}/export?format=pdf
     *
     * @param id     Requirement UUID
     * @param format export format (currently only "pdf" is supported)
     */
    @GetMapping("/{id}/export")
    @Operation(summary = "Export requirement document as PDF")
    public ResponseEntity<byte[]> exportRequirement(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "pdf") String format) {

        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }

        byte[] pdfBytes = requirementExportService.exportRequirementPdf(id, businessId);

        // Resolve the filename from requirement code
        String filename = "requirement_" + id + ".pdf";
        try {
            PmRequirement req = requirementRepository.findByIdAndBusinessId(id, businessId).orElse(null);
            if (req != null && req.getRequirementCode() != null) {
                filename = req.getRequirementCode().replaceAll("[^a-zA-Z0-9_\\-]", "_") + ".pdf";
            }
        } catch (Exception ignored) {}

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    /**
     * Export endpoint matching frontend's RequirementExportService call:
     * POST /api/pm/requirement/export  (body: { requirementId, format, data })
     */
    @PostMapping("/export")
    @Operation(summary = "Export requirement document (POST, matches frontend export service)")
    public ResponseEntity<byte[]> exportRequirementPost(
            @RequestBody java.util.Map<String, Object> body) {

        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }

        Object reqIdObj = body.get("requirementId");
        if (reqIdObj == null) {
            return ResponseEntity.badRequest().build();
        }

        UUID requirementId;
        try {
            requirementId = UUID.fromString(reqIdObj.toString());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        byte[] pdfBytes = requirementExportService.exportRequirementPdf(requirementId, businessId);

        String filename = "requirement_" + requirementId + ".pdf";
        try {
            PmRequirement req = requirementRepository.findByIdAndBusinessId(requirementId, businessId).orElse(null);
            if (req != null && req.getRequirementCode() != null) {
                filename = req.getRequirementCode().replaceAll("[^a-zA-Z0-9_\\-]", "_") + ".pdf";
            }
        } catch (Exception ignored) {}

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}