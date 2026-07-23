package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.SaveImpactAnalysisRequest;
import com.softinter.sicapi.dto.response.ImpactAnalysisResponse;
import com.softinter.sicapi.entity.pm.ChangeImpactAnalysis;
import com.softinter.sicapi.entity.pm.PmRequirementChangeRequest;
import com.softinter.sicapi.repository.pm.ChangeImpactAnalysisRepository;
import com.softinter.sicapi.repository.pm.PmRequirementChangeRequestRepository;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.ImpactAnalysisService;
import com.softinter.sicapi.service.TraceLinkService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImpactAnalysisServiceImpl implements ImpactAnalysisService {

    private final ChangeImpactAnalysisRepository repository;
    private final PmRequirementChangeRequestRepository changeRequestRepository;
    private final CurrentUserService currentUserService;
    private final TraceLinkService traceLinkService;

    @Override
    @Transactional(readOnly = true)
    public ImpactAnalysisResponse getByChangeRequest(UUID changeRequestId) {
        return repository.findByChangeRequestId(changeRequestId)
                .map(this::toResponse)
                .orElse(null);
    }

    @Override
    @Transactional
    public UUID save(SaveImpactAnalysisRequest request) {
        PmRequirementChangeRequest changeRequest = changeRequestRepository
                .findById(request.getChangeRequestId())
                .orElseThrow(() -> new RuntimeException("Change Request not found"));

        ChangeImpactAnalysis analysis = repository
                .findByChangeRequestId(request.getChangeRequestId())
                .orElse(new ChangeImpactAnalysis());

        analysis.setChangeRequest(changeRequest);
        analysis.setDfdImpact(request.getDfdImpact());
        analysis.setErImpact(request.getErImpact());
        analysis.setUiImpact(request.getUiImpact());
        analysis.setApiImpact(request.getApiImpact());
        analysis.setTestImpact(request.getTestImpact());
        analysis.setMandayImpact(request.getMandayImpact());
        analysis.setTimelineImpact(request.getTimelineImpact());
        analysis.setCostImpact(request.getCostImpact());

        analysis.setImpactedRequirementIds(request.getImpactedRequirementIds());
        analysis.setImpactedSpecIds(request.getImpactedSpecIds());
        analysis.setImpactedTaskIds(request.getImpactedTaskIds());
        analysis.setImpactedTestCaseIds(request.getImpactedTestCaseIds());
        analysis.setImpactedBugIds(request.getImpactedBugIds());
        analysis.setImpactedTableNames(request.getImpactedTableNames());

        if (analysis.getAnalysisStatus() == null) {
            analysis.setAnalysisStatus("MANUAL");
        }
        analysis.setAnalyzedAt(Instant.now());
        analysis.setAnalyzedBy(currentUserService.getUserId());

        ChangeImpactAnalysis saved = repository.save(analysis);
        log.info("Impact Analysis saved (MANUAL) for change request: {}", request.getChangeRequestId());
        return saved.getId();
    }

    // ✅ ใช้ REQUIRES_NEW เพื่อไม่ให้ rollback กระทบ transaction หลัก
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ImpactAnalysisResponse autoDetect(UUID changeRequestId) {
        try {
            log.info("Starting auto-detect (legacy) for change request: {}", changeRequestId);
            return autoDetectUsingTrace(changeRequestId);
        } catch (Exception e) {
            log.error("Auto-detect failed for change request: {}", changeRequestId, e);
            return null;
        }
    }

    @Override
    public ImpactAnalysisResponse autoDetectUsingTrace(UUID changeRequestId) {
        log.info("Starting auto-detect using Traceability Engine for change request: {}", changeRequestId);

        PmRequirementChangeRequest changeRequest = changeRequestRepository
                .findById(changeRequestId)
                .orElseThrow(() -> new RuntimeException("Change Request not found"));

        UUID requirementId = changeRequest.getRequirement().getId();

        TraceLinkService.ImpactTraceResult traceResult = traceLinkService.getImpactedItems("REQUIREMENT", requirementId);

        Map<String, Set<UUID>> impacted = traceResult.getImpacted();

        UUID[] reqIds = impacted.getOrDefault("REQUIREMENT", Set.of()).toArray(UUID[]::new);
        UUID[] specIds = impacted.getOrDefault("SPECIFICATION", Set.of()).toArray(UUID[]::new);
        UUID[] taskIds = impacted.getOrDefault("TASK", Set.of()).toArray(UUID[]::new);
        UUID[] testCaseIds = impacted.getOrDefault("TEST_CASE", Set.of()).toArray(UUID[]::new);
        UUID[] bugIds = impacted.getOrDefault("BUG", Set.of()).toArray(UUID[]::new);

        ChangeImpactAnalysis analysis = repository
                .findByChangeRequestId(changeRequestId)
                .orElse(new ChangeImpactAnalysis());

        analysis.setChangeRequest(changeRequest);
        analysis.setImpactedRequirementIds(reqIds);
        analysis.setImpactedSpecIds(specIds);
        analysis.setImpactedTaskIds(taskIds);
        analysis.setImpactedTestCaseIds(testCaseIds);
        analysis.setImpactedBugIds(bugIds);
        analysis.setImpactedTableNames(new String[0]);
        analysis.setAnalysisStatus("AUTO");
        analysis.setAnalyzedAt(Instant.now());
        analysis.setAnalyzedBy(currentUserService.getUserId());

        ChangeImpactAnalysis saved = repository.save(analysis);
        log.info("Auto-detect using Trace completed and saved for change request: {}", changeRequestId);

        return toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
        log.info("Impact Analysis deleted: {}", id);
    }

    private ImpactAnalysisResponse toResponse(ChangeImpactAnalysis entity) {
        ImpactAnalysisResponse dto = new ImpactAnalysisResponse();
        dto.setId(entity.getId());
        dto.setChangeRequestId(entity.getChangeRequest().getId());
        dto.setDfdImpact(entity.getDfdImpact());
        dto.setErImpact(entity.getErImpact());
        dto.setUiImpact(entity.getUiImpact());
        dto.setApiImpact(entity.getApiImpact());
        dto.setTestImpact(entity.getTestImpact());
        dto.setMandayImpact(entity.getMandayImpact());
        dto.setTimelineImpact(entity.getTimelineImpact());
        dto.setCostImpact(entity.getCostImpact());
        dto.setImpactedRequirementIds(entity.getImpactedRequirementIds());
        dto.setImpactedSpecIds(entity.getImpactedSpecIds());
        dto.setImpactedTaskIds(entity.getImpactedTaskIds());
        dto.setImpactedTestCaseIds(entity.getImpactedTestCaseIds());
        dto.setImpactedBugIds(entity.getImpactedBugIds());
        dto.setImpactedTableNames(entity.getImpactedTableNames());
        dto.setAnalysisStatus(entity.getAnalysisStatus());
        dto.setAnalyzedAt(entity.getAnalyzedAt());
        dto.setAnalyzedBy(entity.getAnalyzedBy());
        return dto;
    }
}