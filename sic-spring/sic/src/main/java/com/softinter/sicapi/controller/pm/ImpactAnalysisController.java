// src/main/java/com/softinter/sicapi/controller/pm/ImpactAnalysisController.java
package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.dto.request.SaveImpactAnalysisRequest;
import com.softinter.sicapi.dto.response.ImpactAnalysisResponse;
import com.softinter.sicapi.service.ImpactAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/pm/impact-analysis")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Impact Analysis", description = "Impact Analysis for Change Requests")
public class ImpactAnalysisController {

    private final ImpactAnalysisService service;

    @GetMapping("/change-request/{changeRequestId}")
    @Operation(summary = "Get impact analysis by Change Request ID")
    public ResponseEntity<ImpactAnalysisResponse> getByChangeRequest(@PathVariable UUID changeRequestId) {
        ImpactAnalysisResponse data = service.getByChangeRequest(changeRequestId);
        return data != null ? ResponseEntity.ok(data) : ResponseEntity.notFound().build();
    }

    @PostMapping("/save")
    @Operation(summary = "Save impact analysis (manual or auto)")
    public ResponseEntity<UUID> save(@Valid @RequestBody SaveImpactAnalysisRequest request) {
        UUID id = service.save(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(id);
    }

    @PostMapping("/auto-detect/{changeRequestId}")
    @Operation(summary = "Auto-detect impact from Change Request using database function")
    public ResponseEntity<ImpactAnalysisResponse> autoDetect(@PathVariable UUID changeRequestId) {
        ImpactAnalysisResponse response = service.autoDetect(changeRequestId);
        return response != null
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete impact analysis")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}