package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.SaveImpactAnalysisRequest;
import com.softinter.sicapi.dto.response.ImpactAnalysisResponse;
import com.softinter.sicapi.entity.pm.ChangeImpactAnalysis;
import com.softinter.sicapi.entity.pm.PmChangeRequest;
import com.softinter.sicapi.entity.pm.PmTestCase;
import com.softinter.sicapi.repository.pm.ChangeImpactAnalysisRepository;
import com.softinter.sicapi.repository.pm.PmBugRepository;
import com.softinter.sicapi.repository.pm.PmChangeRequestRepository;
import com.softinter.sicapi.repository.pm.PmDiagramTabRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationRepository;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.pm.PmTestCaseRepository;
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
    private final PmChangeRequestRepository changeRequestRepository;
    private final PmDiagramTabRepository diagramTabRepository;
    private final PmRequirementRepository requirementRepository;
    private final PmSpecificationRepository specificationRepository;
    private final PmTaskRepository taskRepository;
    private final PmTestCaseRepository testCaseRepository;
    private final PmBugRepository bugRepository;
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
        PmChangeRequest changeRequest = changeRequestRepository
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
        analysis.setImpactedDiagramIds(request.getImpactedDiagramIds());
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

        PmChangeRequest changeRequest = changeRequestRepository
                .findById(changeRequestId)
                .orElseThrow(() -> new RuntimeException("Change Request not found"));

        UUID targetId = changeRequest.getTargetId();
        String targetType = changeRequest.getTargetType();

        TraceLinkService.ImpactTraceResult traceResult = traceLinkService.getImpactedItems(targetType,
                targetId);

        Map<String, Set<UUID>> impacted = traceResult.getImpacted();

        UUID[] reqIds = impacted.getOrDefault("REQUIREMENT", Set.of()).toArray(UUID[]::new);
        UUID[] specIds = impacted.getOrDefault("SPECIFICATION", Set.of()).toArray(UUID[]::new);
        Set<UUID> rawTaskIds = new HashSet<>(impacted.getOrDefault("TASK", Set.of()));
        Set<UUID> rawTestCaseIds = new HashSet<>(impacted.getOrDefault("TEST_CASE", Set.of()));
        Set<UUID> rawBugIds = new HashSet<>(impacted.getOrDefault("BUG", Set.of()));

        // ✅ แยก Task ออกเป็น Normal Task vs Bug Task (ที่สร้างเป็น task ไว้ใน Kanban)
        // พร้อมทั้งค้นหา Test Case ที่ผูกกับ Task เหล่านี้
        Set<UUID> normalTaskIds = new HashSet<>();
        for (UUID tId : rawTaskIds) {
            taskRepository.findById(tId).ifPresent(task -> {
                String code = task.getTaskCode() != null ? task.getTaskCode().toUpperCase() : "";
                String name = task.getTaskName() != null ? task.getTaskName().toUpperCase() : "";
                if (code.startsWith("BUG-") || code.startsWith("BUG") || name.startsWith("[BUG]") || name.contains("BUG")) {
                    rawBugIds.add(tId);
                } else {
                    normalTaskIds.add(tId);
                }
            });

            // ค้นหา Test Cases ที่ผูกกับ Task นี้
            try {
                List<PmTestCase> linkedCases = testCaseRepository.findByTaskIdAndIsDeleteFalse(tId);
                for (PmTestCase tc : linkedCases) {
                    rawTestCaseIds.add(tc.getId());
                }
            } catch (Exception ignored) {}
        }

        UUID[] taskIds = normalTaskIds.toArray(UUID[]::new);
        UUID[] testCaseIds = rawTestCaseIds.toArray(UUID[]::new);
        UUID[] bugIds = rawBugIds.toArray(UUID[]::new);

        // ✅ รวบรวม Diagram ทุกประเภท (DIAGRAM, DFD, ER, USECASE, ฯลฯ)
        Set<UUID> diagramSet = new java.util.HashSet<>();
        String[] diagramTypes = {"DIAGRAM", "DFD", "ER", "USECASE", "SEQUENCE", "CLASS"};
        for (String dType : diagramTypes) {
            if (impacted.containsKey(dType)) {
                diagramSet.addAll(impacted.get(dType));
            }
        }
        UUID[] diagramIds = diagramSet.toArray(UUID[]::new);

        ChangeImpactAnalysis analysis = repository
                .findByChangeRequestId(changeRequestId)
                .orElse(new ChangeImpactAnalysis());

        analysis.setChangeRequest(changeRequest);
        analysis.setImpactedRequirementIds(reqIds);
        analysis.setImpactedSpecIds(specIds);
        analysis.setImpactedTaskIds(taskIds);
        analysis.setImpactedTestCaseIds(testCaseIds);
        analysis.setImpactedBugIds(bugIds);
        analysis.setImpactedDiagramIds(diagramIds);
        analysis.setImpactedTableNames(new String[0]);

        // ✅ ประเมิน Manday & Timeline เบื้องต้นอัตโนมัติหากยังไม่ระบุ
        if (analysis.getMandayImpact() == null || analysis.getMandayImpact() == 0) {
            int calculatedManday = Math.max(1, (specIds.length * 2) + taskIds.length + bugIds.length + (int) Math.ceil(diagramIds.length * 1.5));
            analysis.setMandayImpact(calculatedManday);
        }
        if (analysis.getTimelineImpact() == null || analysis.getTimelineImpact() == 0) {
            int calculatedDays = Math.max(1, (int) Math.ceil(analysis.getMandayImpact() / 2.0));
            analysis.setTimelineImpact(calculatedDays);
        }

        analysis.setAnalysisStatus("AUTO");
        analysis.setAnalyzedAt(Instant.now());
        analysis.setAnalyzedBy(currentUserService.getUserId());

        ChangeImpactAnalysis saved = repository.save(analysis);
        log.info("Auto-detect using Trace completed and saved for change request: {} (found {} diagrams)", changeRequestId, diagramIds.length);

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
        
        dto.setImpactedRequirementIds(entity.getImpactedRequirementIds());
        if (entity.getImpactedRequirementIds() != null && entity.getImpactedRequirementIds().length > 0) {
            java.util.List<ImpactAnalysisResponse.ImpactItem> items = new java.util.ArrayList<>();
            for (UUID reqId : entity.getImpactedRequirementIds()) {
                ImpactAnalysisResponse.ImpactItem item = new ImpactAnalysisResponse.ImpactItem();
                item.setId(reqId);
                requirementRepository.findById(reqId).ifPresentOrElse(r -> {
                    item.setCode(r.getRequirementCode());
                    item.setName(r.getTitle());
                }, () -> {
                    item.setCode(reqId.toString().substring(0, 8));
                    item.setName(reqId.toString().substring(0, 8));
                });
                items.add(item);
            }
            dto.setImpactedRequirements(items);
        }

        dto.setImpactedSpecIds(entity.getImpactedSpecIds());
        if (entity.getImpactedSpecIds() != null && entity.getImpactedSpecIds().length > 0) {
            java.util.List<ImpactAnalysisResponse.ImpactItem> items = new java.util.ArrayList<>();
            for (UUID specId : entity.getImpactedSpecIds()) {
                ImpactAnalysisResponse.ImpactItem item = new ImpactAnalysisResponse.ImpactItem();
                item.setId(specId);
                specificationRepository.findById(specId).ifPresentOrElse(s -> {
                    item.setCode(s.getSpecificationCode());
                    item.setName(s.getTitle());
                }, () -> {
                    item.setCode(specId.toString().substring(0, 8));
                    item.setName(specId.toString().substring(0, 8));
                });
                items.add(item);
            }
            dto.setImpactedSpecs(items);
        }

        dto.setImpactedDiagramIds(entity.getImpactedDiagramIds());
        if (entity.getImpactedDiagramIds() != null && entity.getImpactedDiagramIds().length > 0) {
            java.util.List<ImpactAnalysisResponse.DiagramItem> diagramItems = new java.util.ArrayList<>();
            for (UUID diagramId : entity.getImpactedDiagramIds()) {
                ImpactAnalysisResponse.DiagramItem item = new ImpactAnalysisResponse.DiagramItem();
                item.setId(diagramId);
                diagramTabRepository.findById(diagramId).ifPresentOrElse(d -> {
                    item.setName(d.getName());
                    item.setDiagramType(d.getDiagramType());
                }, () -> {
                    item.setName("Diagram " + diagramId.toString().substring(0, 8));
                });
                diagramItems.add(item);
            }
            dto.setImpactedDiagrams(diagramItems);
        }

        dto.setImpactedTaskIds(entity.getImpactedTaskIds());
        if (entity.getImpactedTaskIds() != null && entity.getImpactedTaskIds().length > 0) {
            java.util.List<ImpactAnalysisResponse.ImpactItem> items = new java.util.ArrayList<>();
            for (UUID taskId : entity.getImpactedTaskIds()) {
                ImpactAnalysisResponse.ImpactItem item = new ImpactAnalysisResponse.ImpactItem();
                item.setId(taskId);
                taskRepository.findById(taskId).ifPresentOrElse(t -> {
                    item.setCode(t.getTaskCode());
                    item.setName(t.getTaskName());
                }, () -> {
                    item.setCode(taskId.toString().substring(0, 8));
                    item.setName(taskId.toString().substring(0, 8));
                });
                items.add(item);
            }
            dto.setImpactedTasks(items);
        }

        dto.setImpactedTestCaseIds(entity.getImpactedTestCaseIds());
        if (entity.getImpactedTestCaseIds() != null && entity.getImpactedTestCaseIds().length > 0) {
            java.util.List<ImpactAnalysisResponse.ImpactItem> items = new java.util.ArrayList<>();
            for (UUID tcId : entity.getImpactedTestCaseIds()) {
                ImpactAnalysisResponse.ImpactItem item = new ImpactAnalysisResponse.ImpactItem();
                item.setId(tcId);
                testCaseRepository.findById(tcId).ifPresentOrElse(tc -> {
                    item.setCode(tc.getTestCaseCode());
                    item.setName(tc.getTitle());
                }, () -> {
                    item.setCode(tcId.toString().substring(0, 8));
                    item.setName(tcId.toString().substring(0, 8));
                });
                items.add(item);
            }
            dto.setImpactedTestCases(items);
        }

        dto.setImpactedBugIds(entity.getImpactedBugIds());
        if (entity.getImpactedBugIds() != null && entity.getImpactedBugIds().length > 0) {
            java.util.List<ImpactAnalysisResponse.ImpactItem> items = new java.util.ArrayList<>();
            for (UUID bugId : entity.getImpactedBugIds()) {
                ImpactAnalysisResponse.ImpactItem item = new ImpactAnalysisResponse.ImpactItem();
                item.setId(bugId);
                // พยายามหาใน bugRepository ก่อน ถ้าไม่เจอลองหาใน taskRepository (กรณีเป็น Bug Task)
                bugRepository.findById(bugId).ifPresentOrElse(b -> {
                    item.setCode(b.getBugCode());
                    item.setName(b.getTitle());
                }, () -> {
                    taskRepository.findById(bugId).ifPresentOrElse(t -> {
                        item.setCode(t.getTaskCode());
                        item.setName(t.getTaskName());
                    }, () -> {
                        item.setCode(bugId.toString().substring(0, 8));
                        item.setName(bugId.toString().substring(0, 8));
                    });
                });
                items.add(item);
            }
            dto.setImpactedBugs(items);
        }
        
        dto.setMandayImpact(entity.getMandayImpact());
        dto.setTimelineImpact(entity.getTimelineImpact());
        dto.setAnalysisStatus(entity.getAnalysisStatus());
        dto.setAnalyzedAt(entity.getAnalyzedAt());
        dto.setAnalyzedBy(entity.getAnalyzedBy());
        
        return dto;
    }
}