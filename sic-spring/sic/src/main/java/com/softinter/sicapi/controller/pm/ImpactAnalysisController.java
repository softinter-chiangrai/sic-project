package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.dto.request.AiImpactPreviewRequest;
import com.softinter.sicapi.dto.request.SaveImpactAnalysisRequest;
import com.softinter.sicapi.dto.response.ImpactAnalysisHistoryResponse;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pm/impact-analysis")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Impact Analysis", description = "Impact Analysis for Change Requests")
public class ImpactAnalysisController {

    private final ImpactAnalysisService impactAnalysisService;

    @GetMapping("/change-request/{changeRequestId}")
    @Operation(summary = "Get impact analysis by Change Request ID")
    public ResponseEntity<ImpactAnalysisResponse> getByChangeRequest(@PathVariable UUID changeRequestId) {
        ImpactAnalysisResponse data = impactAnalysisService.getByChangeRequest(changeRequestId);
        return data != null ? ResponseEntity.ok(data) : ResponseEntity.notFound().build();
    }

    @GetMapping("/preview")
    @Operation(summary = "Preview impact analysis by targetType and targetId")
    public ResponseEntity<ImpactAnalysisResponse> previewImpact(
            @RequestParam String targetType,
            @RequestParam UUID targetId,
            @RequestParam(required = false) String changeLevel) {
        ImpactAnalysisResponse response = impactAnalysisService.previewImpact(targetType, targetId, changeLevel);
        return response != null ? ResponseEntity.ok(response) : ResponseEntity.badRequest().build();
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

    // ✅ วิเคราะห์ด้วย AI: Hybrid Engine (Candidate Graph + LLM Semantic Filter)
    @PostMapping("/ai-analyze/{changeRequestId}")
    @Operation(summary = "Analyze impact using AI with Traceability Engine")
    public ResponseEntity<ImpactAnalysisResponse> aiAnalyze(@PathVariable UUID changeRequestId) {
        ImpactAnalysisResponse response = impactAnalysisService.aiAnalyze(changeRequestId);
        return response != null ? ResponseEntity.ok(response) : ResponseEntity.badRequest().build();
    }

    @PostMapping("/ai-preview")
    @Operation(summary = "Preview impact analysis using AI before creating Change Request")
    public ResponseEntity<ImpactAnalysisResponse> aiPreview(@RequestBody AiImpactPreviewRequest request) {
        ImpactAnalysisResponse response = impactAnalysisService.aiPreview(request);
        return response != null ? ResponseEntity.ok(response) : ResponseEntity.badRequest().build();
    }

    // ✅ ประวัติการวิเคราะห์ผลกระทบ (Impact Analysis History)
    @GetMapping("/history/{changeRequestId}")
    @Operation(summary = "Get impact analysis history for a change request")
    public ResponseEntity<List<ImpactAnalysisHistoryResponse>> getHistory(@PathVariable UUID changeRequestId) {
        return ResponseEntity.ok(impactAnalysisService.getHistory(changeRequestId));
    }

    @PostMapping("/history/{historyId}/restore")
    @Operation(summary = "Restore impact analysis from a history version")
    public ResponseEntity<ImpactAnalysisResponse> restoreHistory(@PathVariable UUID historyId) {
        ImpactAnalysisResponse response = impactAnalysisService.restoreHistory(historyId);
        return response != null ? ResponseEntity.ok(response) : ResponseEntity.badRequest().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete impact analysis")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        impactAnalysisService.delete(id);
        return ResponseEntity.noContent().build();
    }
}