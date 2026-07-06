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

import com.softinter.sicapi.dto.request.WorkPackageRequest;
import com.softinter.sicapi.dto.response.WorkPackageResponse;
import com.softinter.sicapi.service.WorkPackageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/pm/work-packages")
@RequiredArgsConstructor
@Slf4j
public class WorkPackageController {

    private final WorkPackageService workPackageService;

    @GetMapping("/milestone/{milestoneId}")
    public ResponseEntity<List<WorkPackageResponse>> getWorkPackagesByMilestoneId(@PathVariable UUID milestoneId) {
        log.info("Getting all work packages for milestone ID: {}", milestoneId);
        List<WorkPackageResponse> workPackages = workPackageService.getWorkPackagesByMilestoneId(milestoneId);
        return ResponseEntity.ok(workPackages);
    }

    @GetMapping("/{wpId}")
    public ResponseEntity<WorkPackageResponse> getWorkPackageById(@PathVariable UUID wpId) {
        log.info("Getting work package by ID: {}", wpId);
        WorkPackageResponse workPackage = workPackageService.getWorkPackageById(wpId);
        return ResponseEntity.ok(workPackage);
    }

    @PostMapping
    public ResponseEntity<WorkPackageResponse> createWorkPackage(@RequestBody WorkPackageRequest request) {
        log.info("Creating new work package for milestone ID: {}", request.getMilestoneId());
        WorkPackageResponse created = workPackageService.createWorkPackage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{wpId}")
    public ResponseEntity<WorkPackageResponse> updateWorkPackage(
            @PathVariable UUID wpId,
            @RequestBody WorkPackageRequest request) {
        log.info("Updating work package ID: {}", wpId);
        WorkPackageResponse updated = workPackageService.updateWorkPackage(wpId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{wpId}")
    public ResponseEntity<Void> deleteWorkPackage(@PathVariable UUID wpId) {
        log.info("Deleting work package ID: {}", wpId);
        workPackageService.deleteWorkPackage(wpId);
        return ResponseEntity.noContent().build();
    }
}