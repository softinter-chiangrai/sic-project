package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.dto.request.PmDiagramReorderRequest;
import com.softinter.sicapi.dto.request.PmDiagramTabRequest;
import com.softinter.sicapi.dto.response.PmDiagramTabResponse;
import com.softinter.sicapi.dto.response.PmDiagramVersionResponse;
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

    @GetMapping
    public ResponseEntity<List<PmDiagramTabResponse>> getTabs(
            @RequestParam(required = false) UUID projectId) {
        return ResponseEntity.ok(tabService.getTabs(projectId));
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