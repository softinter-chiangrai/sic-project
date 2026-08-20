package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmDesignReviewRequest;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.dto.response.PmDesignReviewResponse;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmDesignReviewService;
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

@RestController
@RequestMapping("/api/pm/design-reviews")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Design Review", description = "จัดการข้อมูลตรวจสอบและประเมินงานออกแบบ (Design Review)")
public class PmDesignReviewController {

    private final PmDesignReviewService designReviewService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @Operation(summary = "Get design reviews with pagination and filters")
    public ResponseEntity<PaginationResponse<PmDesignReviewResponse>> getDesignReviews(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "createdDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }

        Page<PmDesignReviewResponse> pageResult = designReviewService.findAll(businessId, projectId, status, keyword, pageable);

        return ResponseEntity.ok(PaginationUtil.of(
                pageResult.getContent(),
                pageable.getPageNumber(),
                pageable.getPageSize(),
                pageResult.getTotalElements()
        ));
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
    public ResponseEntity<com.softinter.sicapi.dto.response.PmReviewCommentResponse> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody com.softinter.sicapi.dto.request.PmReviewCommentRequest request
    ) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        String userId = currentUserService.getUserId();
        com.softinter.sicapi.dto.response.PmReviewCommentResponse response = designReviewService.addComment(id, request, businessId, userId);
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

