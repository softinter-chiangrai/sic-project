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
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
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
    private final PmCustomerProjectRepository customerProjectRepository;
    private final PmCustomerRepository customerRepository;
    private final PmCustomerContractRepository customerContractRepository;
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
        analysis.setImpactedProjectIds(request.getImpactedProjectIds());
        analysis.setImpactedCustomerIds(request.getImpactedCustomerIds());

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

    private ChangeImpactAnalysis computeImpactAnalysis(String targetType, UUID targetId) {
        TraceLinkService.ImpactTraceResult traceResult = traceLinkService.getImpactedItems(targetType, targetId);

        Map<String, Set<UUID>> impacted = traceResult.getImpacted();

        // เป้าหมายระดับโครงการ/สัญญา: ผลกระทบคือเอกสารทั้งหมดของโครงการนั้น (เอกสารผูกกับโครงการผ่าน projectId ไม่ได้ผูกด้วย trace link)
        UUID scopeProjectId = null;
        if ("PROJECT".equalsIgnoreCase(targetType) && targetId != null) {
            scopeProjectId = targetId;
        } else if ("CONTRACT".equalsIgnoreCase(targetType) && targetId != null) {
            scopeProjectId = customerContractRepository.findById(targetId).map(c -> c.getProjectId()).orElse(null);
        }
        if (scopeProjectId != null) {
            UUID bizId = currentUserService != null ? currentUserService.getBusinessId() : null;
            final UUID projectScope = scopeProjectId;
            if (bizId != null) {
                requirementRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(bizId, projectScope)
                        .forEach(r -> impacted.computeIfAbsent("REQUIREMENT", k -> new HashSet<>()).add(r.getId()));
                specificationRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(bizId, projectScope)
                        .forEach(sp -> impacted.computeIfAbsent("SPECIFICATION", k -> new HashSet<>()).add(sp.getId()));
                bugRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(bizId, projectScope,
                                org.springframework.data.domain.PageRequest.of(0, 1000))
                        .getContent()
                        .forEach(bg -> impacted.computeIfAbsent("BUG", k -> new HashSet<>()).add(bg.getId()));
            }
            taskRepository.findByWorkPackageMilestonePhaseProjectIdAndIsDeleteFalse(projectScope)
                    .forEach(t -> impacted.computeIfAbsent("TASK", k -> new HashSet<>()).add(t.getId()));
            testCaseRepository.findByProjectIdAndIsDeleteFalse(projectScope)
                    .forEach(tc -> impacted.computeIfAbsent("TEST_CASE", k -> new HashSet<>()).add(tc.getId()));
            diagramTabRepository.findByProjectIdAndIsDeleteFalseOrderBySortOrderAscCreatedDateAsc(projectScope)
                    .forEach(d -> impacted.computeIfAbsent("DIAGRAM", k -> new HashSet<>()).add(d.getId()));
        }

        UUID[] reqIds = impacted.getOrDefault("REQUIREMENT", Set.of()).toArray(UUID[]::new);
        UUID[] specIds = impacted.getOrDefault("SPECIFICATION", Set.of()).toArray(UUID[]::new);
        Set<UUID> rawTaskIds = new HashSet<>(impacted.getOrDefault("TASK", Set.of()));
        Set<UUID> rawTestCaseIds = new HashSet<>(impacted.getOrDefault("TEST_CASE", Set.of()));
        Set<UUID> rawBugIds = new HashSet<>(impacted.getOrDefault("BUG", Set.of()));

        // ✅ แยก Task ออกเป็น Normal Task vs Bug Task (ที่สร้างเป็น task ไว้ใน Kanban)
        // พร้อมทั้งค้นหา Test Case ที่ผูกกับ Task เหล่านี้ (เฉพาะที่ยังไม่ถูกลบ)
        Set<UUID> normalTaskIds = new HashSet<>();
        for (UUID tId : rawTaskIds) {
            taskRepository.findById(tId).ifPresent(task -> {
                if (Boolean.TRUE.equals(task.getIsDelete())) {
                    return;
                }
                String code = task.getTaskCode() != null ? task.getTaskCode().toUpperCase() : "";
                String name = task.getTaskName() != null ? task.getTaskName().toUpperCase() : "";
                if (code.startsWith("BUG-") || code.startsWith("BUG") || name.startsWith("[BUG]") || name.contains("BUG")) {
                    rawBugIds.add(tId);
                } else {
                    normalTaskIds.add(tId);
                }
            });

            // ค้นหา Test Cases ที่ผูกกับ Task นี้ (เฉพาะที่ยังไม่ถูกลบ)
            try {
                List<PmTestCase> linkedCases = testCaseRepository.findByTaskIdAndIsDeleteFalse(tId);
                for (PmTestCase tc : linkedCases) {
                    if (!Boolean.TRUE.equals(tc.getIsDelete())) {
                        rawTestCaseIds.add(tc.getId());
                    }
                }
            } catch (Exception ignored) {}
        }

        // กรองเฉพาะ Test Case ที่ยังไม่ถูกลบ พร้อมค้นหา Bug ที่ผูกกับ Test Case เหล่านี้
        Set<UUID> activeTestCaseIds = new HashSet<>();
        for (UUID tcId : rawTestCaseIds) {
            testCaseRepository.findById(tcId).ifPresent(tc -> {
                if (!Boolean.TRUE.equals(tc.getIsDelete())) {
                    activeTestCaseIds.add(tcId);
                    try {
                        List<com.softinter.sicapi.entity.pm.PmBug> linkedBugs = bugRepository.findByTestCaseIdAndIsDeleteFalse(tcId);
                        for (com.softinter.sicapi.entity.pm.PmBug b : linkedBugs) {
                            rawBugIds.add(b.getId());
                        }
                    } catch (Exception ignored) {}
                }
            });
        }

        // กรองเฉพาะ Bug Task และ PmBug ที่ยังไม่ถูกลบ
        Set<UUID> activeBugIds = new HashSet<>();
        for (UUID bId : rawBugIds) {
            taskRepository.findById(bId).ifPresent(task -> {
                if (!Boolean.TRUE.equals(task.getIsDelete())) {
                    activeBugIds.add(bId);
                }
            });
            bugRepository.findById(bId).ifPresent(bug -> {
                if (!Boolean.TRUE.equals(bug.getIsDelete())) {
                    activeBugIds.add(bId);
                }
            });
        }

        // กรองเฉพาะ Requirement ที่ยังไม่ถูกลบ
        Set<UUID> activeReqIds = new HashSet<>();
        for (UUID rId : reqIds) {
            requirementRepository.findById(rId).ifPresent(r -> {
                if (!Boolean.TRUE.equals(r.getIsDelete())) {
                    activeReqIds.add(rId);
                }
            });
        }

        // กรองเฉพาะ Specification ที่ยังไม่ถูกลบ
        Set<UUID> activeSpecIds = new HashSet<>();
        for (UUID sId : specIds) {
            specificationRepository.findById(sId).ifPresent(s -> {
                if (!Boolean.TRUE.equals(s.getIsDelete())) {
                    activeSpecIds.add(sId);
                }
            });
        }

        // ✅ Fallback / Enrichment: ตรวจสอบความสัมพันธ์โดยตรงจาก Entity Relations
        if ("SPECIFICATION".equalsIgnoreCase(targetType) && targetId != null) {
            specificationRepository.findById(targetId).ifPresent(spec -> {
                if (spec.getRequirement() != null && !Boolean.TRUE.equals(spec.getRequirement().getIsDelete())) {
                    activeReqIds.add(spec.getRequirement().getId());
                }
            });
        } else if ("REQUIREMENT".equalsIgnoreCase(targetType) && targetId != null) {
            // ค้นหา Specification ที่ผูกกับ Requirement นี้
            List<com.softinter.sicapi.entity.pm.PmSpecification> specs = specificationRepository.findByRequirementIdAndIsDeleteFalse(targetId);
            if (specs != null) {
                for (com.softinter.sicapi.entity.pm.PmSpecification s : specs) {
                    if (!Boolean.TRUE.equals(s.getIsDelete())) {
                        activeSpecIds.add(s.getId());
                    }
                }
            }
        } else if ("TASK".equalsIgnoreCase(targetType) && targetId != null) {
            taskRepository.findById(targetId).ifPresent(task -> {
                if (task.getSpecification() != null && !Boolean.TRUE.equals(task.getSpecification().getIsDelete())) {
                    activeSpecIds.add(task.getSpecification().getId());
                    if (task.getSpecification().getRequirement() != null && !Boolean.TRUE.equals(task.getSpecification().getRequirement().getIsDelete())) {
                        activeReqIds.add(task.getSpecification().getRequirement().getId());
                    }
                }
            });
        } else if ("TEST_CASE".equalsIgnoreCase(targetType) && targetId != null) {
            testCaseRepository.findById(targetId).ifPresent(tc -> {
                if (tc.getTaskId() != null) {
                    normalTaskIds.add(tc.getTaskId());
                    taskRepository.findById(tc.getTaskId()).ifPresent(task -> {
                        if (task.getSpecification() != null && !Boolean.TRUE.equals(task.getSpecification().getIsDelete())) {
                            activeSpecIds.add(task.getSpecification().getId());
                            if (task.getSpecification().getRequirement() != null && !Boolean.TRUE.equals(task.getSpecification().getRequirement().getIsDelete())) {
                                activeReqIds.add(task.getSpecification().getRequirement().getId());
                            }
                        }
                    });
                }
            });
        } else if ("BUG".equalsIgnoreCase(targetType) && targetId != null) {
            bugRepository.findById(targetId).ifPresent(bug -> {
                if (bug.getTestCaseId() != null) {
                    activeTestCaseIds.add(bug.getTestCaseId());
                }
                if (bug.getTaskId() != null) {
                    normalTaskIds.add(bug.getTaskId());
                }
            });
        }

        // เพิ่มเติม: สำหรับทุก Spec ที่ได้รับผลกระทบ ให้ดึง Requirement ที่ผูกอยู่ด้วย
        for (UUID sId : new HashSet<>(activeSpecIds)) {
            specificationRepository.findById(sId).ifPresent(spec -> {
                if (spec.getRequirement() != null && !Boolean.TRUE.equals(spec.getRequirement().getIsDelete())) {
                    activeReqIds.add(spec.getRequirement().getId());
                }
            });
        }

        UUID[] filteredReqIds = activeReqIds.toArray(UUID[]::new);
        UUID[] filteredSpecIds = activeSpecIds.toArray(UUID[]::new);
        UUID[] taskIds = normalTaskIds.toArray(UUID[]::new);
        UUID[] testCaseIds = activeTestCaseIds.toArray(UUID[]::new);
        UUID[] bugIds = activeBugIds.toArray(UUID[]::new);

        // ✅ รวบรวม Diagram ทุกประเภท (DIAGRAM, DFD, ER, USECASE, ฯลฯ)
        Set<UUID> diagramSet = new java.util.HashSet<>();
        String[] diagramTypes = {"DIAGRAM", "DFD", "ER", "USECASE", "SEQUENCE", "CLASS"};
        for (String dType : diagramTypes) {
            if (impacted.containsKey(dType)) {
                diagramSet.addAll(impacted.get(dType));
            }
        }
        UUID[] diagramIds = diagramSet.toArray(UUID[]::new);

        ChangeImpactAnalysis analysis = new ChangeImpactAnalysis();
        analysis.setImpactedRequirementIds(filteredReqIds);
        analysis.setImpactedSpecIds(filteredSpecIds);
        analysis.setImpactedTaskIds(taskIds);
        analysis.setImpactedTestCaseIds(testCaseIds);
        analysis.setImpactedBugIds(bugIds);
        analysis.setImpactedDiagramIds(diagramIds);
        analysis.setImpactedTableNames(new String[0]);

        // ✅ Upstream Resolution (Project & Customer)
        Set<UUID> impactedProjectIds = new HashSet<>();
        Set<UUID> impactedCustomerIds = new HashSet<>();

        // 1. Direct from target
        if ("PROJECT".equalsIgnoreCase(targetType) && targetId != null) {
            impactedProjectIds.add(targetId);
        } else if ("CUSTOMER".equalsIgnoreCase(targetType) && targetId != null) {
            impactedCustomerIds.add(targetId);
        } else if ("CONTRACT".equalsIgnoreCase(targetType) && targetId != null) {
            customerContractRepository.findById(targetId).ifPresent(c -> {
                if (c.getCustomerId() != null) impactedCustomerIds.add(c.getCustomerId());
                if (c.getProjectId() != null) impactedProjectIds.add(c.getProjectId());
            });
        } else if ("REQUIREMENT".equalsIgnoreCase(targetType) && targetId != null) {
            requirementRepository.findById(targetId).ifPresent(r -> {
                if (r.getProjectId() != null) impactedProjectIds.add(r.getProjectId());
            });
        } else if ("SPECIFICATION".equalsIgnoreCase(targetType) && targetId != null) {
            specificationRepository.findById(targetId).ifPresent(s -> {
                if (s.getRequirement() != null && s.getRequirement().getProjectId() != null) {
                    impactedProjectIds.add(s.getRequirement().getProjectId());
                }
            });
        } else if ("TASK".equalsIgnoreCase(targetType) && targetId != null) {
            taskRepository.findById(targetId).ifPresent(t -> {
                if (t.getSpecification() != null && t.getSpecification().getRequirement() != null && t.getSpecification().getRequirement().getProjectId() != null) {
                    impactedProjectIds.add(t.getSpecification().getRequirement().getProjectId());
                }
            });
        } else if (("DIAGRAM".equalsIgnoreCase(targetType) || "DFD".equalsIgnoreCase(targetType) || "ER".equalsIgnoreCase(targetType)) && targetId != null) {
            diagramTabRepository.findById(targetId).ifPresent(d -> {
                if (d.getProjectId() != null) {
                    impactedProjectIds.add(d.getProjectId());
                }
            });
        }

        // 2. From all active downstream items
        for (UUID rId : activeReqIds) {
            requirementRepository.findById(rId).ifPresent(r -> {
                if (r.getProjectId() != null) impactedProjectIds.add(r.getProjectId());
            });
        }
        for (UUID sId : activeSpecIds) {
            specificationRepository.findById(sId).ifPresent(s -> {
                if (s.getRequirement() != null && s.getRequirement().getProjectId() != null) {
                    impactedProjectIds.add(s.getRequirement().getProjectId());
                }
            });
        }
        for (UUID tId : normalTaskIds) {
            taskRepository.findById(tId).ifPresent(t -> {
                if (t.getSpecification() != null && t.getSpecification().getRequirement() != null && t.getSpecification().getRequirement().getProjectId() != null) {
                    impactedProjectIds.add(t.getSpecification().getRequirement().getProjectId());
                }
            });
        }
        for (UUID dId : diagramSet) {
            diagramTabRepository.findById(dId).ifPresent(d -> {
                if (d.getProjectId() != null) {
                    impactedProjectIds.add(d.getProjectId());
                }
            });
        }

        // 3. For all resolved projects, resolve customer
        for (UUID pId : impactedProjectIds) {
            customerProjectRepository.findById(pId).ifPresent(p -> {
                if (p.getCustomerId() != null) {
                    impactedCustomerIds.add(p.getCustomerId());
                }
            });
        }

        analysis.setImpactedProjectIds(impactedProjectIds.toArray(UUID[]::new));
        analysis.setImpactedCustomerIds(impactedCustomerIds.toArray(UUID[]::new));

        // ✅ ประเมิน Manday & Timeline เบื้องต้นอัตโนมัติหากยังไม่ระบุ
        int calculatedManday = Math.max(1, (filteredSpecIds.length * 2) + taskIds.length + bugIds.length + (int) Math.ceil(diagramIds.length * 1.5));
        analysis.setMandayImpact(calculatedManday);
        int calculatedDays = Math.max(1, (int) Math.ceil(calculatedManday / 2.0));
        analysis.setTimelineImpact(calculatedDays);

        analysis.setAnalysisStatus("AUTO");
        analysis.setAnalyzedAt(Instant.now());
        if (currentUserService != null) {
            try {
                analysis.setAnalyzedBy(currentUserService.getUserId());
            } catch (Exception ignored) {}
        }

        return analysis;
    }

    @Override
    @Transactional(readOnly = true)
    public ImpactAnalysisResponse previewImpact(String targetType, UUID targetId) {
        if (targetType == null || targetId == null) {
            return null;
        }
        log.info("Previewing impact analysis for targetType={}, targetId={}", targetType, targetId);
        ChangeImpactAnalysis analysis = computeImpactAnalysis(targetType, targetId);
        return toResponse(analysis);
    }

    @Override
    @Transactional
    public ImpactAnalysisResponse autoDetectUsingTrace(UUID changeRequestId) {
        log.info("Starting auto-detect using Traceability Engine for change request: {}", changeRequestId);

        PmChangeRequest changeRequest = changeRequestRepository
                .findById(changeRequestId)
                .orElseThrow(() -> new RuntimeException("Change Request not found"));

        UUID targetId = changeRequest.getTargetId();
        String targetType = changeRequest.getTargetType();

        ChangeImpactAnalysis computed = computeImpactAnalysis(targetType, targetId);

        ChangeImpactAnalysis analysis = repository
                .findByChangeRequestId(changeRequestId)
                .orElse(new ChangeImpactAnalysis());

        analysis.setChangeRequest(changeRequest);
        analysis.setImpactedRequirementIds(computed.getImpactedRequirementIds());
        analysis.setImpactedSpecIds(computed.getImpactedSpecIds());
        analysis.setImpactedTaskIds(computed.getImpactedTaskIds());
        analysis.setImpactedTestCaseIds(computed.getImpactedTestCaseIds());
        analysis.setImpactedBugIds(computed.getImpactedBugIds());
        analysis.setImpactedDiagramIds(computed.getImpactedDiagramIds());
        analysis.setImpactedTableNames(computed.getImpactedTableNames());
        analysis.setImpactedProjectIds(computed.getImpactedProjectIds());
        analysis.setImpactedCustomerIds(computed.getImpactedCustomerIds());
        analysis.setMandayImpact(computed.getMandayImpact());
        analysis.setTimelineImpact(computed.getTimelineImpact());
        analysis.setAnalysisStatus(computed.getAnalysisStatus());
        analysis.setAnalyzedAt(computed.getAnalyzedAt());
        analysis.setAnalyzedBy(computed.getAnalyzedBy());

        ChangeImpactAnalysis saved = repository.save(analysis);
        log.info("Auto-detect using Trace completed and saved for change request: {} (found {} diagrams)", changeRequestId, analysis.getImpactedDiagramIds().length);

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
        if (entity.getChangeRequest() != null) {
            dto.setChangeRequestId(entity.getChangeRequest().getId());
        }
        
        dto.setImpactedRequirementIds(entity.getImpactedRequirementIds());
        if (entity.getImpactedRequirementIds() != null && entity.getImpactedRequirementIds().length > 0) {
            java.util.List<ImpactAnalysisResponse.ImpactItem> items = new java.util.ArrayList<>();
            for (UUID reqId : entity.getImpactedRequirementIds()) {
                requirementRepository.findById(reqId).ifPresent(r -> {
                    if (!Boolean.TRUE.equals(r.getIsDelete())) {
                        ImpactAnalysisResponse.ImpactItem item = new ImpactAnalysisResponse.ImpactItem();
                        item.setId(reqId);
                        item.setCode(r.getRequirementCode());
                        item.setName(r.getTitle());
                        items.add(item);
                    }
                });
            }
            dto.setImpactedRequirements(items);
        }

        dto.setImpactedSpecIds(entity.getImpactedSpecIds());
        if (entity.getImpactedSpecIds() != null && entity.getImpactedSpecIds().length > 0) {
            java.util.List<ImpactAnalysisResponse.ImpactItem> items = new java.util.ArrayList<>();
            for (UUID specId : entity.getImpactedSpecIds()) {
                specificationRepository.findById(specId).ifPresent(s -> {
                    if (!Boolean.TRUE.equals(s.getIsDelete())) {
                        ImpactAnalysisResponse.ImpactItem item = new ImpactAnalysisResponse.ImpactItem();
                        item.setId(specId);
                        item.setCode(s.getSpecificationCode());
                        item.setName(s.getTitle());
                        items.add(item);
                    }
                });
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
                taskRepository.findById(taskId).ifPresent(t -> {
                    if (!Boolean.TRUE.equals(t.getIsDelete())) {
                        ImpactAnalysisResponse.ImpactItem item = new ImpactAnalysisResponse.ImpactItem();
                        item.setId(taskId);
                        item.setCode(t.getTaskCode());
                        item.setName(t.getTaskName());
                        items.add(item);
                    }
                });
            }
            dto.setImpactedTasks(items);
        }

        dto.setImpactedTestCaseIds(entity.getImpactedTestCaseIds());
        if (entity.getImpactedTestCaseIds() != null && entity.getImpactedTestCaseIds().length > 0) {
            java.util.List<ImpactAnalysisResponse.ImpactItem> items = new java.util.ArrayList<>();
            for (UUID tcId : entity.getImpactedTestCaseIds()) {
                testCaseRepository.findById(tcId).ifPresent(tc -> {
                    if (!Boolean.TRUE.equals(tc.getIsDelete())) {
                        ImpactAnalysisResponse.ImpactItem item = new ImpactAnalysisResponse.ImpactItem();
                        item.setId(tcId);
                        item.setCode(tc.getTestCaseCode());
                        item.setName(tc.getTitle());
                        items.add(item);
                    }
                });
            }
            dto.setImpactedTestCases(items);
        }

        dto.setImpactedBugIds(entity.getImpactedBugIds());
        if (entity.getImpactedBugIds() != null && entity.getImpactedBugIds().length > 0) {
            java.util.List<ImpactAnalysisResponse.ImpactItem> items = new java.util.ArrayList<>();
            for (UUID bugId : entity.getImpactedBugIds()) {
                // พยายามหาใน taskRepository (กรณีเป็น Bug Task) หรือ bugRepository
                taskRepository.findById(bugId).ifPresentOrElse(t -> {
                    if (!Boolean.TRUE.equals(t.getIsDelete())) {
                        ImpactAnalysisResponse.ImpactItem item = new ImpactAnalysisResponse.ImpactItem();
                        item.setId(bugId);
                        item.setCode(t.getTaskCode());
                        item.setName(t.getTaskName());
                        items.add(item);
                    }
                }, () -> {
                    bugRepository.findById(bugId).ifPresent(b -> {
                        if (!Boolean.TRUE.equals(b.getIsDelete())) {
                            ImpactAnalysisResponse.ImpactItem item = new ImpactAnalysisResponse.ImpactItem();
                            item.setId(bugId);
                            item.setCode(b.getBugCode());
                            item.setName(b.getTitle());
                            items.add(item);
                        }
                    });
                });
            }
            dto.setImpactedBugs(items);
        }

        dto.setImpactedProjectIds(entity.getImpactedProjectIds());
        if (entity.getImpactedProjectIds() != null && entity.getImpactedProjectIds().length > 0) {
            java.util.List<ImpactAnalysisResponse.ProjectImpactItem> projectItems = new java.util.ArrayList<>();
            for (UUID pId : entity.getImpactedProjectIds()) {
                customerProjectRepository.findById(pId).ifPresent(p -> {
                    if (!Boolean.TRUE.equals(p.getIsDelete())) {
                        ImpactAnalysisResponse.ProjectImpactItem item = new ImpactAnalysisResponse.ProjectImpactItem();
                        item.setId(p.getId());
                        item.setCode(p.getProjectCode());
                        item.setName(p.getProjectName());
                        item.setStatus(p.getStatus());
                        item.setCustomerId(p.getCustomerId());
                        if (p.getCustomer() != null) {
                            item.setCustomerName(p.getCustomer().getCompanyNameLocal() != null ? p.getCustomer().getCompanyNameLocal() : p.getCustomer().getCompanyNameEn());
                        } else if (p.getCustomerId() != null) {
                            customerRepository.findById(p.getCustomerId()).ifPresent(c -> {
                                item.setCustomerName(c.getCompanyNameLocal() != null ? c.getCompanyNameLocal() : c.getCompanyNameEn());
                            });
                        }
                        projectItems.add(item);
                    }
                });
            }
            dto.setImpactedProjects(projectItems);
        }

        dto.setImpactedCustomerIds(entity.getImpactedCustomerIds());
        if (entity.getImpactedCustomerIds() != null && entity.getImpactedCustomerIds().length > 0) {
            java.util.List<ImpactAnalysisResponse.CustomerImpactItem> customerItems = new java.util.ArrayList<>();
            for (UUID cId : entity.getImpactedCustomerIds()) {
                customerRepository.findById(cId).ifPresent(c -> {
                    if (!Boolean.TRUE.equals(c.getIsDelete())) {
                        ImpactAnalysisResponse.CustomerImpactItem item = new ImpactAnalysisResponse.CustomerImpactItem();
                        item.setId(c.getId());
                        item.setCode(c.getCustomerCode());
                        item.setName(c.getCompanyNameLocal() != null ? c.getCompanyNameLocal() : c.getCompanyNameEn());
                        customerItems.add(item);
                    }
                });
            }
            dto.setImpactedCustomers(customerItems);
        }
        
        dto.setMandayImpact(entity.getMandayImpact());
        dto.setTimelineImpact(entity.getTimelineImpact());
        dto.setAnalysisStatus(entity.getAnalysisStatus());
        dto.setAnalyzedAt(entity.getAnalyzedAt());
        dto.setAnalyzedBy(entity.getAnalyzedBy());
        
        return dto;
    }
}