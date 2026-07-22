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

    // ✅ ใช้ชื่อ field ให้ตรงกับ error
    private final ImpactAnalysisService impactAnalysisService;

    @GetMapping("/change-request/{changeRequestId}")
    @Operation(summary = "Get impact analysis by Change Request ID")
    public ResponseEntity<ImpactAnalysisResponse> getByChangeRequest(@PathVariable UUID changeRequestId) {
        ImpactAnalysisResponse data = impactAnalysisService.getByChangeRequest(changeRequestId);
        return data != null ? ResponseEntity.ok(data) : ResponseEntity.notFound().build();
    }

    @PostMapping("/save")
    @Operation(summary = "Save impact analysis (manual or auto)")
    public ResponseEntity<UUID> save(@Valid @RequestBody SaveImpactAnalysisRequest request) {
        UUID id = impactAnalysisService.save(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(id);
    }

    @PostMapping("/auto-detect/{changeRequestId}")
    @Operation(summary = "Auto-detect impact using database function (legacy)")
    public ResponseEntity<ImpactAnalysisResponse> autoDetect(@PathVariable UUID changeRequestId) {
        ImpactAnalysisResponse response = impactAnalysisService.autoDetect(changeRequestId);
        return response != null ? ResponseEntity.ok(response) : ResponseEntity.badRequest().build();
    }

    // ✅ ใหม่: ใช้ Traceability Engine
    @PostMapping("/auto-detect-trace/{changeRequestId}")
    @Operation(summary = "Auto-detect impact using Traceability Engine")
    public ResponseEntity<ImpactAnalysisResponse> autoDetectUsingTrace(@PathVariable UUID changeRequestId) {
        ImpactAnalysisResponse response = impactAnalysisService.autoDetectUsingTrace(changeRequestId);
        return response != null ? ResponseEntity.ok(response) : ResponseEntity.badRequest().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete impact analysis")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        impactAnalysisService.delete(id);
        return ResponseEntity.noContent().build();
    }
}