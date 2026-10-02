package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmDiagramReorderRequest;
import com.softinter.sicapi.service.PmDiagramExportService;
import com.softinter.sicapi.util.ReportHelper;
import com.softinter.sicapi.dto.request.PmDiagramTabRequest;
import com.softinter.sicapi.dto.response.PmDiagramTabResponse;
import com.softinter.sicapi.dto.response.PmDiagramVersionResponse;
import com.softinter.sicapi.service.ApprovalService;
import com.softinter.sicapi.service.PmDiagramTabService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/diagram/tabs")
@RequiredArgsConstructor
public class PmDiagramTabController {

    private final PmDiagramTabService tabService;
    private final ApprovalService approvalService;
    private final PmDiagramExportService exportService;

    @GetMapping
    public ResponseEntity<List<PmDiagramTabResponse>> getTabs(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(tabService.getTabs(projectId, keyword));
    }

    @GetMapping("/combobox")
    public ResponseEntity<List<com.softinter.sicapi.dto.response.ComboboxResponse>> getComboboxDiagrams(
            @RequestParam(required = false) UUID projectId) {
        return ResponseEntity.ok(tabService.getComboboxDiagrams(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PmDiagramTabResponse> getTab(@PathVariable UUID id) {
        return ResponseEntity.ok(tabService.getTab(id));
    }

    @PostMapping
    public ResponseEntity<PmDiagramTabResponse> createTab(@Valid @RequestBody PmDiagramTabRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tabService.createTab(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PmDiagramTabResponse> updateTab(
            @PathVariable UUID id,
            @Valid @RequestBody PmDiagramTabRequest request) {
        return ResponseEntity.ok(tabService.updateTab(id, request));
    }

    /** body.image = PNG data URI ที่ draw.io export จากแผนภาพที่เปิดอยู่ */
    @PostMapping("/{id}/export-pdf")
    public ResponseEntity<byte[]> exportPdf(
            @PathVariable UUID id,
            @RequestBody(required = false) java.util.Map<String, Object> body,
            @RequestParam(required = false) String lang,
            @RequestHeader(value = "x-language-code", required = false) String headerLang) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        String imageDataUri = null;
        java.util.List<java.util.Map<String, Object>> requestPages = null;
        if (body != null) {
            if (body.get("image") instanceof String img) {
                imageDataUri = img;
            }
            if (body.get("pages") instanceof java.util.List<?> list) {
                requestPages = new java.util.ArrayList<>();
                for (Object item : list) {
                    if (item instanceof java.util.Map<?, ?> m) {
                        requestPages.add((java.util.Map<String, Object>) m);
                    }
                }
            }
        }
        byte[] pdf = exportService.exportDiagramPdf(id, businessId, ReportHelper.resolveLang(lang, headerLang),
                imageDataUri, requestPages);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"diagram-" + id + ".pdf\"")
                .body(pdf);
    }

    /** Export ทุก Diagram ของ Project เป็น PDF ไฟล์เดียว */
    @PostMapping("/export-all-pdf")
    public ResponseEntity<byte[]> exportAllPdf(
            @RequestParam UUID projectId,
            @RequestBody(required = false) java.util.Map<String, String> body,
            @RequestParam(required = false) String lang,
            @RequestHeader(value = "x-language-code", required = false) String headerLang) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        UUID currentTabId = null;
        if (body != null && body.get("currentTabId") != null && !body.get("currentTabId").isBlank()) {
            try {
                currentTabId = UUID.fromString(body.get("currentTabId"));
            } catch (Exception ignored) {}
        }
        String currentImage = body != null ? body.get("image") : null;
        byte[] pdf = exportService.exportAllDiagramsPdf(projectId, currentTabId, businessId,
                ReportHelper.resolveLang(lang, headerLang), currentImage);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"diagrams-all-" + projectId + ".pdf\"")
                .body(pdf);
    }

    @PostMapping("/{id}/create-revision")
    public ResponseEntity<PmDiagramTabResponse> createRevision(@PathVariable UUID id) {
        approvalService.createRevision("DIAGRAM", id, "สร้าง Revision ใหม่จากเอกสารที่อนุมัติแล้ว");
        return ResponseEntity.ok(tabService.getTab(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTab(@PathVariable UUID id) {
        tabService.deleteTab(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<PmDiagramTabResponse> duplicateTab(@PathVariable UUID id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tabService.duplicateTab(id));
    }

    @PostMapping("/reorder")
    public ResponseEntity<Void> reorderTabs(@Valid @RequestBody PmDiagramReorderRequest request) {
        tabService.reorderTabs(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<List<PmDiagramVersionResponse>> getVersions(@PathVariable UUID id) {
        return ResponseEntity.ok(tabService.getVersions(id));
    }

    @PostMapping("/{id}/restore/{versionId}")
    public ResponseEntity<PmDiagramTabResponse> restoreVersion(
            @PathVariable UUID id,
            @PathVariable UUID versionId) {
        return ResponseEntity.ok(tabService.restoreVersion(id, versionId));
    }
}