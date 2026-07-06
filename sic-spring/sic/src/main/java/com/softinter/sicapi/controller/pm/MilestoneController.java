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

import com.softinter.sicapi.dto.request.MilestoneRequest;
import com.softinter.sicapi.dto.response.MilestoneResponse;
import com.softinter.sicapi.service.MilestoneService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/pm/milestones")
@RequiredArgsConstructor
@Slf4j
public class MilestoneController {

    private final MilestoneService milestoneService;

    @GetMapping("/phase/{phaseId}")
    public ResponseEntity<List<MilestoneResponse>> getMilestonesByPhaseId(@PathVariable UUID phaseId) {
        log.info("Getting all milestones for phase ID: {}", phaseId);
        List<MilestoneResponse> milestones = milestoneService.getMilestonesByPhaseId(phaseId);
        return ResponseEntity.ok(milestones);
    }

    @GetMapping("/{milestoneId}")
    public ResponseEntity<MilestoneResponse> getMilestoneById(@PathVariable UUID milestoneId) {
        log.info("Getting milestone by ID: {}", milestoneId);
        MilestoneResponse milestone = milestoneService.getMilestoneById(milestoneId);
        return ResponseEntity.ok(milestone);
    }

    @PostMapping
    public ResponseEntity<MilestoneResponse> createMilestone(@RequestBody MilestoneRequest request) {
        log.info("Creating new milestone for phase ID: {}", request.getPhaseId());
        MilestoneResponse created = milestoneService.createMilestone(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{milestoneId}")
    public ResponseEntity<MilestoneResponse> updateMilestone(
            @PathVariable UUID milestoneId,
            @RequestBody MilestoneRequest request) {
        log.info("Updating milestone ID: {}", milestoneId);
        MilestoneResponse updated = milestoneService.updateMilestone(milestoneId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{milestoneId}")
    public ResponseEntity<Void> deleteMilestone(@PathVariable UUID milestoneId) {
        log.info("Deleting milestone ID: {}", milestoneId);
        milestoneService.deleteMilestone(milestoneId);
        return ResponseEntity.noContent().build();
    }
}