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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.softinter.sicapi.dto.request.PhaseRequest;
import com.softinter.sicapi.dto.response.ComboboxResponse;
import com.softinter.sicapi.dto.response.PhaseResponse;
import com.softinter.sicapi.entity.pm.PmPhase;
import com.softinter.sicapi.repository.pm.PmPhaseRepository;
import com.softinter.sicapi.service.PhaseService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/pm")
@RequiredArgsConstructor
@Slf4j
public class PhaseController {

    private final PhaseService phaseService;
    private final PmPhaseRepository phaseRepository;

    // ===== Phase Combobox (ค้นหาได้อิสระ หรือกรองตาม projectId) =====
    @GetMapping("/phases/combobox")
    public ResponseEntity<List<ComboboxResponse>> getComboboxPhases(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) String keyword) {
        UUID businessId = com.softinter.sicapi.config.BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        String normalizedKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        List<PmPhase> phases;
        if (projectId != null) {
            phases = phaseRepository.findByProjectIdAndIsDeleteFalseOrderByStartDateAsc(projectId);
        } else if (normalizedKeyword != null) {
            phases = phaseRepository.findByBusinessIdAndKeyword(businessId, normalizedKeyword);
        } else {
            phases = phaseRepository.findByProjectBusinessIdAndIsDeleteFalseAndProjectIsDeleteFalse(businessId);
        }
        List<ComboboxResponse> list = phases.stream()
                .map(p -> new ComboboxResponse(p.getId().toString(),
                        (p.getPhaseCode() != null ? p.getPhaseCode() + " - " : "") + p.getPhaseName()))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // ===== Phase CRUD =====

    @GetMapping("/phases")
    public ResponseEntity<List<PhaseResponse>> getPhases(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) String keyword) {
        if (projectId != null) {
            return ResponseEntity.ok(phaseService.getPhasesByProjectId(projectId));
        }
        UUID businessId = com.softinter.sicapi.config.BusinessContextHolder.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(phaseService.getPhasesByBusinessId(businessId, keyword));
    }

    @GetMapping("/projects/{projectId}/phases")
    public ResponseEntity<List<PhaseResponse>> getPhasesByProjectId(@PathVariable UUID projectId) {
        log.info("Getting all phases for project ID: {}", projectId);
        List<PhaseResponse> phases = phaseService.getPhasesByProjectId(projectId);
        return ResponseEntity.ok(phases);
    }

    @GetMapping("/phases/{phaseId}")
    public ResponseEntity<PhaseResponse> getPhaseById(@PathVariable UUID phaseId) {
        log.info("Getting phase by ID: {}", phaseId);
        PhaseResponse phase = phaseService.getPhaseById(phaseId);
        return ResponseEntity.ok(phase);
    }

    @PostMapping("/projects/{projectId}/phases")
    public ResponseEntity<PhaseResponse> createPhase(
            @PathVariable UUID projectId,
            @RequestBody PhaseRequest request) {
        log.info("Creating new phase for project ID: {}", projectId);
        // Ensure the projectId in path matches the one in request
        request.setProjectId(projectId);
        PhaseResponse created = phaseService.createPhase(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/phases/{phaseId}")
    public ResponseEntity<PhaseResponse> updatePhase(
            @PathVariable UUID phaseId,
            @RequestBody PhaseRequest request) {
        log.info("Updating phase ID: {}", phaseId);
        PhaseResponse updated = phaseService.updatePhase(phaseId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/phases/{phaseId}")
    public ResponseEntity<Void> deletePhase(@PathVariable UUID phaseId) {
        log.info("Deleting phase ID: {}", phaseId);
        phaseService.deletePhase(phaseId);
        return ResponseEntity.noContent().build();
    }
}