package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmCustomerProjectRequest;
import com.softinter.sicapi.dto.response.ApiResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.dto.response.ComboboxResponse;
import com.softinter.sicapi.dto.response.PmCustomerProjectResponse;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.service.PmCustomerProjectService;
import com.softinter.sicapi.util.PaginationUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import com.softinter.sicapi.service.PmCustomerProjectExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/pm/customer-projects")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Customer Project", description = "จัดการข้อมูลโครงการของลูกค้า")
public class PmCustomerProjectController {

    private final PmCustomerProjectService projectService;
    private final PmCustomerProjectExportService projectExportService;
    private final com.softinter.sicapi.service.impl.ProjectGeneratorService projectGeneratorService;
    private final PmCustomerProjectRepository projectRepository;

    @PostMapping("/generate/draft")
    @Operation(summary = "Generate project charter/plan draft with AI")
    public ResponseEntity<com.softinter.sicapi.dto.response.ProjectDraft> generateDraft(
            @RequestBody com.softinter.sicapi.dto.request.GenerateProjectDraftRequest req) {
        return ResponseEntity.ok(projectGeneratorService.generateDraft(req));
    }

    @GetMapping
    @Operation(summary = "รายการโครงการของลูกค้า (แบบแบ่งหน้า)")
    public ResponseEntity<PaginationResponse<PmCustomerProjectResponse>> getProjects(
            @RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        UUID businessId = BusinessContextHolder.getBusinessId();

        Sort sort = com.softinter.sicapi.util.SortValidator.build(
                com.softinter.sicapi.entity.pm.PmCustomerProject.class, sortBy, sortDirection, "createdDate");
        Pageable pageable = PaginationUtil.toPageable(page, size, sort);

        Page<PmCustomerProjectResponse> pageResult;
        if (customerId != null) {
            if (keyword != null && !keyword.isBlank()) {
                pageResult = projectService.searchByCustomerId(customerId, businessId, keyword, pageable);
            } else {
                pageResult = projectService.findByCustomerId(customerId, businessId, pageable);
            }
        } else {
            pageResult = projectService.findAllByBusinessId(businessId, keyword, pageable);
        }

        return ResponseEntity.ok(PaginationUtil.of(pageResult));
    }


    @GetMapping("/combobox")
    @Operation(summary = "Get project combobox list (ค้นหาได้อิสระ ไม่ต้องมี parent มาก่อน)")
    public ResponseEntity<java.util.List<ComboboxResponse>> getComboboxProjects(
            @RequestParam(required = false) String keyword) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        java.util.List<PmCustomerProject> projects = (keyword != null && !keyword.isBlank())
                ? projectRepository.findByBusinessIdAndIsDeleteFalseAndProjectNameContainingIgnoreCase(
                        businessId, keyword, org.springframework.data.domain.PageRequest.of(0, 50)).getContent()
                : projectRepository.findByBusinessIdAndIsDeleteFalse(businessId);
        java.util.List<ComboboxResponse> list = projects.stream()
                .map(p -> new ComboboxResponse(p.getId().toString(), p.getProjectName()))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "ดึงข้อมูลโครงการโดย ID")
    public ResponseEntity<PmCustomerProjectResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.findById(id));
    }

    @GetMapping("/{id}/export")
    @Operation(summary = "Export project document as PDF (JasperReports)")
    public ResponseEntity<byte[]> exportProject(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "pdf") String format) {

        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }

        byte[] pdfBytes = projectExportService.exportProjectPdf(id, businessId);

        String filename = "project_" + id + ".pdf";
        try {
            PmCustomerProjectResponse proj = projectService.findById(id);
            if (proj != null && proj.getProjectCode() != null) {
                filename = proj.getProjectCode().replaceAll("[^a-zA-Z0-9_\\-]", "_") + ".pdf";
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

    @PostMapping
    @Operation(summary = "สร้างโครงการใหม่")
    public ResponseEntity<ApiResponse<UUID>> create(@Valid @RequestBody PmCustomerProjectRequest request) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Business context not found"));
        }
        PmCustomerProjectResponse response = projectService.create(businessId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response.getId(), "Project created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "แก้ไขโครงการ")
    public ResponseEntity<ApiResponse<UUID>> update(@PathVariable UUID id,
                                                    @Valid @RequestBody PmCustomerProjectRequest request) {
        PmCustomerProjectResponse response = projectService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(response.getId(), "Project updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "ลบโครงการ (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        projectService.delete(id);
        return ResponseEntity.noContent().build();
    }
}