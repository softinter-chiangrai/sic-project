package com.softinter.sicapi.controller.pm;

import com.softinter.sicapi.dto.request.DocumentVersionRequest;
import com.softinter.sicapi.dto.response.DocumentVersionResponse;
import com.softinter.sicapi.service.DocumentVersionService;
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
@RequestMapping("/api/pm/document-versions")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Document Version", description = "Document Version Management API")
public class DocumentVersionController {

    private final DocumentVersionService versionService;

    @GetMapping
    @Operation(summary = "Get all versions of a document")
    public ResponseEntity<List<DocumentVersionResponse>> getVersions(
            @RequestParam String documentType,
            @RequestParam UUID documentId) {
        return ResponseEntity.ok(versionService.getVersions(documentType, documentId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific version by ID")
    public ResponseEntity<DocumentVersionResponse> getVersion(@PathVariable UUID id) {
        return ResponseEntity.ok(versionService.getVersion(id));
    }

    @PostMapping
    @Operation(summary = "Create a new document version")
    public ResponseEntity<UUID> saveVersion(@Valid @RequestBody DocumentVersionRequest request) {
        UUID id = versionService.saveVersion(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(id);
    }

    @PostMapping("/{id}/activate")
    @Operation(summary = "Set a specific version as active")
    public ResponseEntity<Void> activateVersion(@PathVariable UUID id) {
        versionService.activateVersion(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a document version (soft delete)")
    public ResponseEntity<Void> deleteVersion(@PathVariable UUID id) {
        versionService.deleteVersion(id);
        return ResponseEntity.noContent().build();
    }
}