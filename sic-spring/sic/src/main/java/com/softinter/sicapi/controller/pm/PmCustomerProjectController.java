package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmCustomerProjectRequest;
import com.softinter.sicapi.dto.response.ApiResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.dto.response.PmCustomerProjectResponse;
import com.softinter.sicapi.service.PmCustomerProjectService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/pm/customer-projects")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "PmCustomerProject", description = "API สำหรับจัดการโครงการของลูกค้า")
public class PmCustomerProjectController {

    private final PmCustomerProjectService projectService;

    @GetMapping
    @Operation(summary = "รายการโครงการของลูกค้า (แบบแบ่งหน้า)")
    public ResponseEntity<PaginationResponse<PmCustomerProjectResponse>> getProjects(
            @RequestParam UUID customerId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir) {

        UUID businessId = BusinessContextHolder.getBusinessId();
        Pageable pageable = buildPageable(page, size, sortBy, sortDir);

        Page<PmCustomerProjectResponse> pageResult;
        if (keyword != null && !keyword.isBlank()) {
            pageResult = projectService.searchByCustomerId(customerId, businessId, keyword, pageable);
        } else {
            pageResult = projectService.findByCustomerId(customerId, businessId, pageable);
        }

        return ResponseEntity.ok(PaginationUtil.of(pageResult.getContent(), page - 1, size, pageResult.getTotalElements()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "ดึงข้อมูลโครงการโดย ID")
    public ResponseEntity<PmCustomerProjectResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.findById(id));
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

    private Pageable buildPageable(int page, int size, String sortBy, String sortDir) {
        if (sortBy == null || sortBy.isBlank()) {
            sortBy = "createdDate";
        }
        Sort.Direction direction = (sortDir != null && sortDir.equalsIgnoreCase("desc"))
                ? Sort.Direction.DESC : Sort.Direction.ASC;
        return PageRequest.of(page - 1, size, Sort.by(direction, sortBy));
    }
}