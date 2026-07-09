// sic-spring/sic/src/main/java/com/softinter/sicapi/controller/pm/PmApprovalFlowController.java
package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.dto.request.SaveApprovalFlowRequest;
import com.softinter.sicapi.dto.response.ApprovalFlowResponse;
import com.softinter.sicapi.service.ApprovalFlowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pm/approval-flows")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Approval Flow", description = "Approval Flow Management API")
public class PmApprovalFlowController {

    private final ApprovalFlowService approvalFlowService;

    @GetMapping
    @Operation(summary = "Get all approval flows")
    public ResponseEntity<List<ApprovalFlowResponse>> getAll() {
        return ResponseEntity.ok(approvalFlowService.getAllFlows());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get approval flow by ID")
    public ResponseEntity<ApprovalFlowResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(approvalFlowService.getFlow(id));
    }

    @PostMapping
    @Operation(summary = "Create new approval flow")
    public ResponseEntity<ApprovalFlowResponse> create(@Valid @RequestBody SaveApprovalFlowRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(approvalFlowService.createFlow(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update approval flow")
    public ResponseEntity<ApprovalFlowResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody SaveApprovalFlowRequest request) {
        return ResponseEntity.ok(approvalFlowService.updateFlow(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete approval flow (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        approvalFlowService.deleteFlow(id);
        return ResponseEntity.noContent().build();
    }
}