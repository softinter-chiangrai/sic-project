package com.softinter.sicapi.controller.su;

import com.softinter.sicapi.dto.request.AuditLogRequest;
import com.softinter.sicapi.dto.response.AuditLogResponse;
import com.softinter.sicapi.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/su/audit-logs")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Audit Log", description = "System & Business Audit Log Management API")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @Operation(summary = "Search and filter audit logs with pagination")
    public ResponseEntity<Page<AuditLogResponse>> getLogs(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String username,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ResponseEntity.ok(auditLogService.getLogs(searchTerm, module, status, username, page, size, sortBy, sortDir));
    }

    @PostMapping
    @Operation(summary = "Record a manual audit log entry")
    public ResponseEntity<Void> recordLog(@Valid @RequestBody AuditLogRequest request) {
        auditLogService.logAsync(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
