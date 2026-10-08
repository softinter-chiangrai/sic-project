package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmDesignReviewRequest;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.dto.response.PmDesignReviewResponse;
import com.softinter.sicapi.service.ApprovalService;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmDesignReviewService;
import com.softinter.sicapi.service.impl.PmDesignReviewExportService;
import com.softinter.sicapi.util.PaginationUtil;
import com.softinter.sicapi.util.ReportHelper;
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
import com.softinter.sicapi.dto.response.ComboboxResponse;
import java.util.List;
import com.softinter.sicapi.entity.pm.PmDesignReview;
import com.softinter.sicapi.dto.request.PmReviewCommentRequest;
import com.softinter.sicapi.dto.response.PmReviewCommentResponse;
import com.softinter.sicapi.util.SortValidator;

@RestController
@RequestMapping("/api/pm/design-reviews")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Design Review", description = "จัดการข้อมูลตรวจสอบและประเมินงานออกแบบ (Design Review)")
public class PmDesignReviewController {

    private final PmDesignReviewService designReviewService;
    private final CurrentUserService currentUserService;
    private final ApprovalService approvalService;
    private final PmDesignReviewExportService exportService;

    @GetMapping
    @Operation(summary = "Get design reviews with pagination and filters")
    public ResponseEntity<PaginationResponse<PmDesignReviewResponse>> getDesignReviews(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }

        Sort sort = SortValidator.build(
                PmDesignReview.class, sortBy, sortDirection, "createdDate");
        Pageable pageable = PaginationUtil.toPageable(page, size, sort);

        Page<PmDesignReviewResponse> pageResult = designReviewService.findAll(businessId, projectId, status, keyword, pageable);

        return ResponseEntity.ok(PaginationUtil.of(pageResult));
    }

    // ===== Combobox Endpoints =====
    @GetMapping("/combobox")
    @Operation(summary = "Get combobox design reviews")
    public ResponseEntity<List<ComboboxResponse>> getComboboxDesignReviews(
            @RequestParam(required = false) UUID projectId
    ) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(designReviewService.getComboboxDesignReviews(businessId, projectId));
    }

    @GetMapping("/combobox-specification")
    @Operation(summary = "Get combobox specifications/reviewables for Design Review")
    public ResponseEntity<List<ComboboxResponse>> getComboboxSpecifications(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String value
    ) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(designReviewService.getComboboxSpecifications(businessId, projectId, type, value));
    }

    @GetMapping("/combobox-project")
    @Operation(summary = "Get combobox projects for Design Review")
    public ResponseEntity<List<ComboboxResponse>> getComboboxProjects() {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(designReviewService.getComboboxProjects(businessId));
    }

    @GetMapping("/combobox-requirement")
    @Operation(summary = "Get combobox requirements for Design Review")
    public ResponseEntity<List<ComboboxResponse>> getComboboxRequirements(
            @RequestParam(required = false) UUID projectId
    ) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(designReviewService.getComboboxRequirements(businessId, projectId));
    }

    @GetMapping("/combobox-task")
    @Operation(summary = "Get combobox tasks for Design Review")
    public ResponseEntity<List<ComboboxResponse>> getComboboxTasks(
            @RequestParam(required = false) UUID projectId
    ) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(designReviewService.getComboboxTasks(businessId, projectId));
    }

    @GetMapping("/combobox-user")
    @Operation(summary = "Get combobox users for Design Review")
    public ResponseEntity<List<ComboboxResponse>> getComboboxUsers() {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(designReviewService.getComboboxUsers(businessId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get design review by ID")
    public ResponseEntity<PmDesignReviewResponse> getById(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(designReviewService.findById(id, businessId));
    }

    @GetMapping("/{id}/export-pdf")
    @Operation(summary = "Export design review report as PDF")
    public ResponseEntity<byte[]> exportPdf(
            @PathVariable UUID id,
            @RequestParam(required = false) String lang,
            @RequestHeader(value = "x-language-code", required = false) String headerLang
    ) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        designReviewService.findById(id, businessId); // ตรวจว่ามีอยู่จริงและอยู่ใน business นี้
        byte[] pdf = exportService.exportPdf(id, businessId, ReportHelper.resolveLang(lang, headerLang));
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"design-review-" + id + ".pdf\"")
                .body(pdf);
    }

    @PostMapping("/{id}/create-revision")
    @Operation(summary = "Create a new draft revision from an approved design review")
    public ResponseEntity<PmDesignReviewResponse> createRevision(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        approvalService.createRevision("DESIGN_REVIEW", id, "สร้าง Revision ใหม่จากเอกสารที่อนุมัติแล้ว");
        return ResponseEntity.ok(designReviewService.findById(id, businessId));
    }

    @PostMapping
    @Operation(summary = "Create or update design review")
    public ResponseEntity<UUID> save(@Valid @RequestBody PmDesignReviewRequest request) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = currentUserService.getUserId();
        UUID id = designReviewService.save(request, businessId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(id);
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Add comment to design review")
    public ResponseEntity<PmReviewCommentResponse> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody PmReviewCommentRequest request
    ) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = currentUserService.getUserId();
        PmReviewCommentResponse response = designReviewService.addComment(id, request, businessId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete design review")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = currentUserService.getUserId();
        designReviewService.delete(id, businessId, userId);
        return ResponseEntity.noContent().build();
    }
}

