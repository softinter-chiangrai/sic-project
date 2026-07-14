package com.softinter.sicapi.controller.pm;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.softinter.sicapi.dto.request.PmDiagramProjectRequest;
import com.softinter.sicapi.dto.response.PmDiagramProjectResponse;
import com.softinter.sicapi.service.PmDiagramProjectService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/diagram/projects")
@RequiredArgsConstructor
public class PmDiagramProjectController {

    private final PmDiagramProjectService projectService;

    @GetMapping
    public ResponseEntity<List<PmDiagramProjectResponse>> getProjects() {
        return ResponseEntity.ok(projectService.getProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PmDiagramProjectResponse> getProject(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getProject(id));
    }

    @PostMapping
    public ResponseEntity<PmDiagramProjectResponse> createProject(@Valid @RequestBody PmDiagramProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PmDiagramProjectResponse> updateProject(
            @PathVariable UUID id,
            @Valid @RequestBody PmDiagramProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<PmDiagramProjectResponse> toggleFavorite(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.toggleFavorite(id));
    }
}