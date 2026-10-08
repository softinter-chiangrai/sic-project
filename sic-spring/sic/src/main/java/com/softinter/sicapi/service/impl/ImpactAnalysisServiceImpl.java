package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.util.Arrays;
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
import com.softinter.sicapi.repository.pm.PmDeliveryItemRepository;
import com.softinter.sicapi.repository.pm.PmDeliveryRepository;
import com.softinter.sicapi.repository.pm.PmDesignReviewRepository;
import com.softinter.sicapi.repository.pm.PmDiagramTabRepository;
import com.softinter.sicapi.repository.pm.PmInvoiceRepository;
import com.softinter.sicapi.repository.pm.PmMaTicketRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationRepository;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.pm.PmTestCaseRepository;
import com.softinter.sicapi.repository.pm.PmUserManualRepository;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.ImpactAnalysisService;
import com.softinter.sicapi.service.PmAiProviderService;
import com.softinter.sicapi.service.TraceLinkService;
import com.softinter.sicapi.dto.request.AiAttachmentDto;
import com.softinter.sicapi.dto.request.AiImpactPreviewRequest;
import com.softinter.sicapi.dto.response.ImpactAnalysisHistoryResponse;
import com.softinter.sicapi.entity.pm.ChangeImpactAnalysisHistory;
import com.softinter.sicapi.repository.pm.ChangeImpactAnalysisHistoryRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.softinter.sicapi.exception.ResourceNotFoundException;
import java.util.ArrayList;
import org.springframework.data.domain.PageRequest;
import com.softinter.sicapi.entity.enums.MaTicketStatus;
import com.softinter.sicapi.entity.enums.PaymentStatus;
import com.softinter.sicapi.entity.pm.PmBug;
import com.softinter.sicapi.entity.pm.PmSpecification;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImpactAnalysisServiceImpl implements ImpactAnalysisService {

    private final ChangeImpactAnalysisRepository repository;
    private final PmChangeRequestRepository changeRequestRepository;
    private final PmDiagramTabRepository diagramTabRepository;
    private final PmDesignReviewRepository designReviewRepository;
    private final PmDeliveryRepository deliveryRepository;
    private final PmDeliveryItemRepository deliveryItemRepository;
    private final PmUserManualRepository userManualRepository;
    private final PmInvoiceRepository invoiceRepository;
    private final PmMaTicketRepository maTicketRepository;
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
    private final PmAiProviderService aiProviderService;
    private final ObjectMapper objectMapper;
    private final ChangeImpactAnalysisHistoryRepository historyRepository;

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
                .orElseThrow(() -> new ResourceNotFoundException("Change Request not found"));

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
        recordHistory(saved);
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
        return computeImpactAnalysis(targetType, targetId, "MINOR");
    }

    private ChangeImpactAnalysis computeImpactAnalysis(String targetType, UUID targetId, String changeLevel) {
        ChangeImpactAnalysis nonTraced = computeForUntracedDocument(targetType, targetId, changeLevel);
        if (nonTraced != null) {
            return nonTraced;
        }

        // เป้าหมายเป็น Design Review: ผลกระทบคือสิ่งที่ถูกตรวจทาน (Specification / Diagram / Requirement) และทุกอย่างที่เชื่อมกับมัน
        // ไม่ใช้ trace link ของ Design Review เอง เพราะลิงก์นั้นชี้ไปหาเอกสารที่ถูกตรวจแค่ชั้นเดียว
        if ("DESIGN_REVIEW".equalsIgnoreCase(targetType) && targetId != null) {
            var item = designReviewRepository.findById(targetId)
                    .filter(dr -> dr.getReviewItemType() != null && dr.getReviewItemId() != null)
                    .orElse(null);
            if (item != null) {
                return computeImpactAnalysis(item.getReviewItemType().trim().toUpperCase(), item.getReviewItemId(), changeLevel);
            }
        }

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
                                PageRequest.of(0, 1000))
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
                // กรองเฉพาะ Task ที่ยังไม่เสร็จสิ้น (ตัด DONE, CANCELLED)
                String tStatus = task.getStatus() != null ? task.getStatus().toUpperCase() : "";
                if ("DONE".equals(tStatus) || "CANCELLED".equals(tStatus)) {
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
                        List<PmBug> linkedBugs = bugRepository.findByTestCaseIdAndIsDeleteFalse(tcId);
                        for (PmBug b : linkedBugs) {
                            rawBugIds.add(b.getId());
                        }
                    } catch (Exception ignored) {}
                }
            });
        }

        // กรองเฉพาะ Bug Task และ PmBug ที่ยังเปิดอยู่ (ตัด CLOSED, RESOLVED, REJECTED, CANCELLED)
        Set<UUID> activeBugIds = new HashSet<>();
        for (UUID bId : rawBugIds) {
            taskRepository.findById(bId).ifPresent(task -> {
                if (!Boolean.TRUE.equals(task.getIsDelete())) {
                    String tStatus = task.getStatus() != null ? task.getStatus().toUpperCase() : "";
                    if (!"DONE".equals(tStatus) && !"CANCELLED".equals(tStatus)) {
                        activeBugIds.add(bId);
                    }
                }
            });
            bugRepository.findById(bId).ifPresent(bug -> {
                if (!Boolean.TRUE.equals(bug.getIsDelete())) {
                    String bStatus = bug.getStatus() != null ? bug.getStatus().toUpperCase() : "";
                    if (!"CLOSED".equals(bStatus) && !"RESOLVED".equals(bStatus) && !"REJECTED".equals(bStatus) && !"CANCELLED".equals(bStatus)) {
                        activeBugIds.add(bId);
                    }
                }
            });
        }

        // กรองเฉพาะ Requirement ที่ยังใช้งานอยู่ (ตัด CANCELLED, REJECTED)
        Set<UUID> activeReqIds = new HashSet<>();
        for (UUID rId : reqIds) {
            requirementRepository.findById(rId).ifPresent(r -> {
                if (!Boolean.TRUE.equals(r.getIsDelete())) {
                    String rStatus = r.getStatus() != null ? r.getStatus().toUpperCase() : "";
                    if (!"CANCELLED".equals(rStatus) && !"REJECTED".equals(rStatus)) {
                        activeReqIds.add(rId);
                    }
                }
            });
        }

        // กรองเฉพาะ Specification ที่ยังใช้งานอยู่ (ตัด CANCELLED, REJECTED)
        Set<UUID> activeSpecIds = new HashSet<>();
        for (UUID sId : specIds) {
            specificationRepository.findById(sId).ifPresent(s -> {
                if (!Boolean.TRUE.equals(s.getIsDelete())) {
                    String sStatus = s.getStatus() != null ? s.getStatus().toUpperCase() : "";
                    if (!"CANCELLED".equals(sStatus) && !"REJECTED".equals(sStatus)) {
                        activeSpecIds.add(sId);
                    }
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
            List<PmSpecification> specs = specificationRepository.findByRequirementIdAndIsDeleteFalse(targetId);
            if (specs != null) {
                for (PmSpecification s : specs) {
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
        Set<UUID> diagramSet = new HashSet<>();
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

        // ✅ ประเมิน Manday & Timeline เบื้องต้นอัตโนมัติโดยคำนึงถึง Change Level (PATCH=0.5x, MINOR=1.0x, MAJOR=2.0x)
        double levelMultiplier = switch (changeLevel != null ? changeLevel.toUpperCase() : "MINOR") {
            case "PATCH" -> 0.5;
            case "MAJOR" -> 2.0;
            default -> 1.0;
        };
        int baseManday = (filteredSpecIds.length * 2) + taskIds.length + bugIds.length + (int) Math.ceil(diagramIds.length * 1.5);
        int calculatedManday = Math.max(1, (int) Math.round(baseManday * levelMultiplier));
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

    /**
     * เอกสารที่ระบบไม่สร้าง trace link ไว้เลย (Delivery, User Manual, Invoice, MA Ticket) การไล่กราฟจึงได้ผลว่างเสมอ
     * จึงหาผลกระทบจากความสัมพันธ์ในตัวเอกสารเองแทน คืน null ถ้าไม่ใช่เอกสารกลุ่มนี้ (ให้ใช้ตรรกะ trace เดิม)
     */
    private ChangeImpactAnalysis computeForUntracedDocument(String targetType, UUID targetId, String changeLevel) {
        if (targetType == null || targetId == null) {
            return null;
        }
        switch (targetType.toUpperCase()) {
            case "DELIVERY": {
                var delivery = deliveryRepository.findById(targetId).orElse(null);
                Set<UUID> reqs = new HashSet<>(), specs = new HashSet<>(), cases = new HashSet<>(), diagrams = new HashSet<>();
                // ผลกระทบของการส่งมอบ คือสิ่งที่ถูกส่งมอบอยู่ในรายการของมัน
                for (var item : deliveryItemRepository.findByDeliveryIdAndIsDeleteFalseOrderBySortOrderAsc(targetId)) {
                    if (item.getItemType() == null || item.getItemId() == null) continue;
                    switch (item.getItemType().toUpperCase()) {
                        case "REQUIREMENT" -> reqs.add(item.getItemId());
                        case "SPECIFICATION" -> specs.add(item.getItemId());
                        case "TEST_CASE" -> cases.add(item.getItemId());
                        case "DIAGRAM" -> diagrams.add(item.getItemId());
                        default -> { }
                    }
                }
                return scopeAnalysis(delivery == null ? null : delivery.getProjectId(), null, reqs, specs, cases, diagrams, changeLevel);
            }
            case "USER_MANUAL": {
                var manual = userManualRepository.findById(targetId).orElse(null);
                if (manual == null) return scopeAnalysis(null, null, Set.of(), Set.of(), Set.of(), Set.of(), changeLevel);
                // คู่มือผูกกับ Specification: ผลกระทบคือเดียวกับการแก้ Specification นั้น
                ChangeImpactAnalysis analysis = manual.getRelatedSpecId() != null
                        ? computeImpactAnalysis("SPECIFICATION", manual.getRelatedSpecId(), changeLevel)
                        : scopeAnalysis(null, null, Set.of(), Set.of(), Set.of(), Set.of(), changeLevel);
                return withProject(analysis, manual.getProjectId());
            }
            case "INVOICE": {
                // ใบแจ้งหนี้ไม่กระทบ Requirement/Spec/Task จึงมีผลแค่ระดับโครงการและลูกค้า
                var invoice = invoiceRepository.findById(targetId).orElse(null);
                return scopeAnalysis(invoice == null ? null : invoice.getProjectId(), invoice == null ? null : invoice.getCustomerId(),
                        Set.of(), Set.of(), Set.of(), Set.of(), changeLevel);
            }
            case "MA_TICKET": {
                var ticket = maTicketRepository.findById(targetId).orElse(null);
                return scopeAnalysis(ticket == null ? null : ticket.getProjectId(), ticket == null ? null : ticket.getCustomerId(),
                        Set.of(), Set.of(), Set.of(), Set.of(), changeLevel);
            }
            default:
                return null;
        }
    }

    private ChangeImpactAnalysis withProject(ChangeImpactAnalysis analysis, UUID projectId) {
        if (projectId == null) return analysis;
        Set<UUID> projects = new HashSet<>(Arrays.asList(analysis.getImpactedProjectIds() == null ? new UUID[0] : analysis.getImpactedProjectIds()));
        Set<UUID> customers = new HashSet<>(Arrays.asList(analysis.getImpactedCustomerIds() == null ? new UUID[0] : analysis.getImpactedCustomerIds()));
        projects.add(projectId);
        customerProjectRepository.findById(projectId).ifPresent(p -> {
            if (p.getCustomerId() != null) customers.add(p.getCustomerId());
        });
        analysis.setImpactedProjectIds(projects.toArray(UUID[]::new));
        analysis.setImpactedCustomerIds(customers.toArray(UUID[]::new));
        return analysis;
    }

    /** สร้างผลวิเคราะห์จากรายการเอกสารที่ระบุตรงๆ (ไม่ไล่กราฟ) พร้อมประเมิน manday ด้วยสูตรเดียวกับการไล่กราฟ */
    private ChangeImpactAnalysis scopeAnalysis(UUID projectId, UUID customerId, Set<UUID> reqs, Set<UUID> specs, Set<UUID> cases, Set<UUID> diagrams, String changeLevel) {
        ChangeImpactAnalysis analysis = new ChangeImpactAnalysis();
        analysis.setImpactedRequirementIds(reqs.toArray(UUID[]::new));
        analysis.setImpactedSpecIds(specs.toArray(UUID[]::new));
        analysis.setImpactedTaskIds(new UUID[0]);
        analysis.setImpactedTestCaseIds(cases.toArray(UUID[]::new));
        analysis.setImpactedBugIds(new UUID[0]);
        analysis.setImpactedDiagramIds(diagrams.toArray(UUID[]::new));
        analysis.setImpactedTableNames(new String[0]);
        analysis.setImpactedProjectIds(new UUID[0]);
        analysis.setImpactedCustomerIds(customerId == null ? new UUID[0] : new UUID[] { customerId });
        withProject(analysis, projectId);

        double levelMultiplier = switch (changeLevel != null ? changeLevel.toUpperCase() : "MINOR") {
            case "PATCH" -> 0.5;
            case "MAJOR" -> 2.0;
            default -> 1.0;
        };
        int baseManday = specs.size() * 2 + (int) Math.ceil(diagrams.size() * 1.5);
        int manday = Math.max(1, (int) Math.round(baseManday * levelMultiplier));
        analysis.setMandayImpact(manday);
        analysis.setTimelineImpact(Math.max(1, (int) Math.ceil(manday / 2.0)));
        analysis.setAnalysisStatus("AUTO");
        analysis.setAnalyzedAt(Instant.now());
        try {
            analysis.setAnalyzedBy(currentUserService.getUserId());
        } catch (Exception ignored) {
        }
        return analysis;
    }

    @Override
    @Transactional(readOnly = true)
    public ImpactAnalysisResponse previewImpact(String targetType, UUID targetId) {
        return previewImpact(targetType, targetId, "MINOR");
    }

    @Override
    @Transactional(readOnly = true)
    public ImpactAnalysisResponse previewImpact(String targetType, UUID targetId, String changeLevel) {
        if (targetType == null || targetId == null) {
            return null;
        }
        log.info("Previewing impact analysis for targetType={}, targetId={}, changeLevel={}", targetType, targetId, changeLevel);
        ChangeImpactAnalysis analysis = computeImpactAnalysis(targetType, targetId, changeLevel);
        return toResponse(analysis);
    }

    @Override
    @Transactional
    public ImpactAnalysisResponse autoDetectUsingTrace(UUID changeRequestId) {
        log.info("Starting auto-detect using Traceability Engine for change request: {}", changeRequestId);

        PmChangeRequest changeRequest = changeRequestRepository
                .findById(changeRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Change Request not found"));

        UUID targetId = changeRequest.getTargetId();
        String targetType = changeRequest.getTargetType();
        String changeLevel = changeRequest.getChangeLevel();

        ChangeImpactAnalysis computed = computeImpactAnalysis(targetType, targetId, changeLevel);

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
        recordHistory(saved);
        log.info("Auto-detect using Trace completed and saved for change request: {} (found {} diagrams)", changeRequestId, analysis.getImpactedDiagramIds().length);

        return toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
        log.info("Impact Analysis deleted: {}", id);
    }

    private static Set<UUID> idSet(UUID[] ids) {
        return ids == null ? new HashSet<>() : new HashSet<>(Arrays.asList(ids));
    }

    private static ImpactAnalysisResponse.ImpactItem item(UUID id, String code, String name) {
        ImpactAnalysisResponse.ImpactItem item = new ImpactAnalysisResponse.ImpactItem();
        item.setId(id);
        item.setCode(code);
        item.setName(name);
        return item;
    }

    /**
     * หาเอกสารส่งมอบ/ดูแลที่ได้รับผลกระทบจากเอกสารที่วิเคราะห์ได้แล้ว โดยอ่านความสัมพันธ์ในตัวเอกสารเอง (ไม่ต้องให้ผู้ใช้ผูกเพิ่ม)
     * - User Manual: ผูก Specification ที่ได้รับผลกระทบ
     * - Delivery: มี Requirement/Spec/Test Case/Diagram ที่ได้รับผลกระทบอยู่ในรายการส่งมอบ
     * - Invoice: ออกจาก Delivery ที่ได้รับผลกระทบ
     * - MA Ticket: ไม่มีความสัมพันธ์กับเอกสารระดับ Spec จึงนับทุกใบของโครงการที่ได้รับผลกระทบ
     */
    private void fillDerivedDocuments(ChangeImpactAnalysis entity, ImpactAnalysisResponse dto) {
        Set<UUID> reqs = idSet(entity.getImpactedRequirementIds());
        Set<UUID> specs = idSet(entity.getImpactedSpecIds());
        Set<UUID> cases = idSet(entity.getImpactedTestCaseIds());
        Set<UUID> diagrams = idSet(entity.getImpactedDiagramIds());
        Set<UUID> projects = idSet(entity.getImpactedProjectIds());

        List<ImpactAnalysisResponse.ImpactItem> manuals = new ArrayList<>();
        if (!specs.isEmpty()) {
            userManualRepository.findByRelatedSpecIdInAndIsDeleteFalse(specs)
                    .forEach(m -> {
                        String mStatus = m.getStatus() != null ? m.getStatus().toUpperCase() : "";
                        if (!"CANCELLED".equals(mStatus) && !"OBSOLETE".equals(mStatus)) {
                            manuals.add(item(m.getId(), m.getManualCode(), m.getManualTitle()));
                        }
                    });
        }

        Set<UUID> deliveryIds = new HashSet<>();
        Set<UUID> itemIds = new HashSet<>();
        itemIds.addAll(reqs);
        itemIds.addAll(specs);
        itemIds.addAll(cases);
        itemIds.addAll(diagrams);
        if (!itemIds.isEmpty()) {
            for (var di : deliveryItemRepository.findByItemIdInAndIsDeleteFalse(itemIds)) {
                if (di.getItemType() == null) continue;
                boolean hit = switch (di.getItemType().toUpperCase()) {
                    case "REQUIREMENT" -> reqs.contains(di.getItemId());
                    case "SPECIFICATION" -> specs.contains(di.getItemId());
                    case "TEST_CASE" -> cases.contains(di.getItemId());
                    case "DIAGRAM" -> diagrams.contains(di.getItemId());
                    default -> false;
                };
                if (hit) deliveryIds.add(di.getDeliveryId());
            }
        }
        List<ImpactAnalysisResponse.ImpactItem> deliveries = new ArrayList<>();
        Set<UUID> activeDeliveryIds = new HashSet<>();
        if (!deliveryIds.isEmpty()) {
            for (var d : deliveryRepository.findAllById(deliveryIds)) {
                if (Boolean.TRUE.equals(d.getIsDelete())) continue;
                // กรองเฉพาะ Delivery ที่ยังไม่ตรวจรับเสร็จสิ้นสมบูรณ์ (ตัด CONFIRMED, CANCELLED)
                String dStatus = d.getStatus() != null ? d.getStatus().toUpperCase() : "";
                if ("CONFIRMED".equals(dStatus) || "CANCELLED".equals(dStatus)) continue;
                activeDeliveryIds.add(d.getId());
                deliveries.add(item(d.getId(), d.getDeliveryCode(), d.getDeliveryTitle()));
            }
        }

        List<ImpactAnalysisResponse.ImpactItem> invoices = new ArrayList<>();
        if (!activeDeliveryIds.isEmpty()) {
            invoiceRepository.findByDeliveryIdInAndIsDeleteFalse(activeDeliveryIds)
                    .forEach(i -> {
                        // กรองเฉพาะ Invoice ที่ยังไม่ชำระเงินเสร็จสิ้น (ตัด PAID, CANCELLED)
                        if (i.getPaymentStatus() != PaymentStatus.PAID && i.getPaymentStatus() != PaymentStatus.CANCELLED) {
                            invoices.add(item(i.getId(), i.getInvoiceNo(), i.getRemark()));
                        }
                    });
        }

        List<ImpactAnalysisResponse.ImpactItem> tickets = new ArrayList<>();
        if (!projects.isEmpty()) {
            maTicketRepository.findByProjectIdInAndIsDeleteFalse(projects)
                    .forEach(t -> {
                        // กรองตั๋ว MA ที่ยังเปิดอยู่ (ตัด CLOSED, RESOLVED)
                        if (t.getStatus() == null || (t.getStatus() != MaTicketStatus.CLOSED && t.getStatus() != MaTicketStatus.RESOLVED)) {
                            tickets.add(item(t.getId(), t.getTicketNo(), t.getTitle()));
                        }
                    });
        }

        dto.setImpactedManuals(manuals);
        dto.setImpactedManualIds(manuals.stream().map(ImpactAnalysisResponse.ImpactItem::getId).toArray(UUID[]::new));
        dto.setImpactedDeliveries(deliveries);
        dto.setImpactedDeliveryIds(deliveries.stream().map(ImpactAnalysisResponse.ImpactItem::getId).toArray(UUID[]::new));
        dto.setImpactedInvoices(invoices);
        dto.setImpactedInvoiceIds(invoices.stream().map(ImpactAnalysisResponse.ImpactItem::getId).toArray(UUID[]::new));
        dto.setImpactedMaTickets(tickets);
        dto.setImpactedMaTicketIds(tickets.stream().map(ImpactAnalysisResponse.ImpactItem::getId).toArray(UUID[]::new));
    }

    private ImpactAnalysisResponse toResponse(ChangeImpactAnalysis entity) {
        ImpactAnalysisResponse dto = new ImpactAnalysisResponse();
        
        dto.setId(entity.getId());
        if (entity.getChangeRequest() != null) {
            dto.setChangeRequestId(entity.getChangeRequest().getId());
        }
        
        dto.setImpactedRequirementIds(entity.getImpactedRequirementIds());
        if (entity.getImpactedRequirementIds() != null && entity.getImpactedRequirementIds().length > 0) {
            List<ImpactAnalysisResponse.ImpactItem> items = new ArrayList<>();
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
            List<ImpactAnalysisResponse.ImpactItem> items = new ArrayList<>();
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
            List<ImpactAnalysisResponse.DiagramItem> diagramItems = new ArrayList<>();
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

        fillDerivedDocuments(entity, dto);

        dto.setImpactedTaskIds(entity.getImpactedTaskIds());
        if (entity.getImpactedTaskIds() != null && entity.getImpactedTaskIds().length > 0) {
            List<ImpactAnalysisResponse.ImpactItem> items = new ArrayList<>();
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
            List<ImpactAnalysisResponse.ImpactItem> items = new ArrayList<>();
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
            List<ImpactAnalysisResponse.ImpactItem> items = new ArrayList<>();
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
            List<ImpactAnalysisResponse.ProjectImpactItem> projectItems = new ArrayList<>();
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
            List<ImpactAnalysisResponse.CustomerImpactItem> customerItems = new ArrayList<>();
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

        dto.setDfdImpact(entity.getDfdImpact());
        dto.setErImpact(entity.getErImpact());
        dto.setUiImpact(entity.getUiImpact());
        dto.setApiImpact(entity.getApiImpact());
        dto.setTestImpact(entity.getTestImpact());
        dto.setCostImpact(entity.getCostImpact());
        dto.setAiRationale(entity.getAiRationale());

        return dto;
    }

    @Override
    @Transactional
    public ImpactAnalysisResponse aiAnalyze(UUID changeRequestId) {
        log.info("Starting AI-assisted impact analysis for change request: {}", changeRequestId);

        PmChangeRequest changeRequest = changeRequestRepository
                .findById(changeRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Change Request not found"));

        UUID targetId = changeRequest.getTargetId();
        String targetType = changeRequest.getTargetType();
        String changeLevel = changeRequest.getChangeLevel();

        ChangeImpactAnalysis computed = computeImpactAnalysis(targetType, targetId, changeLevel);
        ImpactAnalysisResponse response = toResponse(computed);

        // Apply AI semantic triage
        applyAiSemanticTriage(response, targetType, changeRequest.getTitle(), changeRequest.getDescription(),
                changeRequest.getChangeReason(), changeLevel, null, null);

        // Persist to DB
        ChangeImpactAnalysis analysis = repository
                .findByChangeRequestId(changeRequestId)
                .orElse(new ChangeImpactAnalysis());

        analysis.setChangeRequest(changeRequest);
        analysis.setImpactedRequirementIds(response.getImpactedRequirementIds());
        analysis.setImpactedSpecIds(response.getImpactedSpecIds());
        analysis.setImpactedTaskIds(response.getImpactedTaskIds());
        analysis.setImpactedTestCaseIds(response.getImpactedTestCaseIds());
        analysis.setImpactedBugIds(response.getImpactedBugIds());
        analysis.setImpactedDiagramIds(response.getImpactedDiagramIds());
        analysis.setImpactedTableNames(new String[0]);
        analysis.setImpactedProjectIds(response.getImpactedProjectIds());
        analysis.setImpactedCustomerIds(response.getImpactedCustomerIds());
        analysis.setMandayImpact(response.getMandayImpact());
        analysis.setTimelineImpact(response.getTimelineImpact());
        analysis.setAnalysisStatus("AI");
        analysis.setAnalyzedAt(Instant.now());
        if (currentUserService != null) {
            try {
                analysis.setAnalyzedBy(currentUserService.getUserId());
            } catch (Exception ignored) {}
        }

        analysis.setAiRationale(response.getAiRationale());
        ChangeImpactAnalysis saved = repository.save(analysis);
        recordHistory(saved);
        log.info("AI-assisted impact analysis completed and saved for change request: {}", changeRequestId);

        ImpactAnalysisResponse finalResponse = toResponse(saved);
        finalResponse.setAiRationale(response.getAiRationale());
        return finalResponse;
    }

    @Override
    @Transactional(readOnly = true)
    public ImpactAnalysisResponse aiPreview(AiImpactPreviewRequest request) {
        if (request == null || request.getTargetType() == null || request.getTargetId() == null) {
            return null;
        }
        log.info("AI previewing impact analysis for targetType={}, targetId={}, changeLevel={}",
                request.getTargetType(), request.getTargetId(), request.getChangeLevel());

        ChangeImpactAnalysis computed = computeImpactAnalysis(request.getTargetType(), request.getTargetId(), request.getChangeLevel());
        if (computed == null) {
            return null;
        }
        ImpactAnalysisResponse response = toResponse(computed);

        applyAiSemanticTriage(response, request.getTargetType(), request.getTitle(), request.getDescription(),
                request.getChangeReason(), request.getChangeLevel(), request.getModel(), request.getAttachments());

        return response;
    }

    private void applyAiSemanticTriage(ImpactAnalysisResponse response, String targetType,
                                        String title, String description, String changeReason,
                                        String changeLevel, String modelId, List<AiAttachmentDto> attachments) {
        if (aiProviderService == null || objectMapper == null) {
            return;
        }

        try {
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append("คุณเป็นระบบวิเคราะห์ผลกระทบซอฟต์แวร์อัจฉริยะ (Software Architecture & SDLC Impact Analysis Engine)\n");
            promptBuilder.append("โปรดวิเคราะห์คำขอเปลี่ยนแปลง (Change Request) เทียบกับรายการเอกสาร/อาร์ติแฟกต์ที่เชื่อมโยงทางโครงสร้าง (Candidate Documents) ");
            promptBuilder.append("เพื่อตัด False Positives (รายการที่ไม่เกี่ยวกับบริบทการแก้นี้จริงๆ ออกไป เช่น MA Tickets ของโมดูลอื่นที่อยู่ในโครงการเดียวกัน หรือเอกสารเก่าที่ไม่ได้รับผลกระทบ), ");
            promptBuilder.append("ประเมิน Manday และ Timeline (จำนวนวันทำการ) ที่สมจริง, และสรุปเหตุผลเป็นภาษาไทย (aiRationale)\n\n");

            promptBuilder.append("=== ข้อมูลคำขอเปลี่ยนแปลง (Change Request) ===\n");
            promptBuilder.append("ประเภทเป้าหมาย (Target Type): ").append(targetType != null ? targetType : "N/A").append("\n");
            promptBuilder.append("ชื่อเรื่อง (Title): ").append(title != null ? title : "N/A").append("\n");
            promptBuilder.append("รายละเอียด (Description): ").append(description != null ? description : "N/A").append("\n");
            promptBuilder.append("เหตุผลการเปลี่ยน (Change Reason): ").append(changeReason != null ? changeReason : "N/A").append("\n");
            promptBuilder.append("ระดับการเปลี่ยน (Change Level): ").append(changeLevel != null ? changeLevel : "MINOR").append("\n\n");

            promptBuilder.append("=== รายการเอกสาร Candidate ที่เชื่อมโยงทางโครงสร้าง ===\n");
            appendCandidates(promptBuilder, "SPECIFICATIONS", response.getImpactedSpecs());
            appendDiagramCandidates(promptBuilder, "DIAGRAMS", response.getImpactedDiagrams());
            appendCandidates(promptBuilder, "REQUIREMENTS", response.getImpactedRequirements());
            appendCandidates(promptBuilder, "TASKS", response.getImpactedTasks());
            appendCandidates(promptBuilder, "TEST_CASES", response.getImpactedTestCases());
            appendCandidates(promptBuilder, "BUGS", response.getImpactedBugs());
            appendCandidates(promptBuilder, "USER_MANUALS", response.getImpactedManuals());
            appendCandidates(promptBuilder, "DELIVERIES", response.getImpactedDeliveries());
            appendCandidates(promptBuilder, "INVOICES", response.getImpactedInvoices());
            appendCandidates(promptBuilder, "MA_TICKETS", response.getImpactedMaTickets());

            promptBuilder.append("\n=== คำสั่งและรูปแบบผลลัพธ์ ===\n");
            promptBuilder.append("ตอบกลับเป็น JSON เท่านั้น (Strict JSON object, ห้ามมีคำนำหรือคำลงท้ายนอกเครื่องหมายปีกกา) ตามโครงสร้างนี้:\n");
            promptBuilder.append("{\n");
            promptBuilder.append("  \"retainedRequirementIds\": [\"uuid\"],\n");
            promptBuilder.append("  \"retainedSpecIds\": [\"uuid\"],\n");
            promptBuilder.append("  \"retainedDiagramIds\": [\"uuid\"],\n");
            promptBuilder.append("  \"retainedTaskIds\": [\"uuid\"],\n");
            promptBuilder.append("  \"retainedTestCaseIds\": [\"uuid\"],\n");
            promptBuilder.append("  \"retainedBugIds\": [\"uuid\"],\n");
            promptBuilder.append("  \"retainedManualIds\": [\"uuid\"],\n");
            promptBuilder.append("  \"retainedDeliveryIds\": [\"uuid\"],\n");
            promptBuilder.append("  \"retainedInvoiceIds\": [\"uuid\"],\n");
            promptBuilder.append("  \"retainedMaTicketIds\": [\"uuid\"],\n");
            promptBuilder.append("  \"mandayImpact\": 3,\n");
            promptBuilder.append("  \"timelineImpact\": 2,\n");
            promptBuilder.append("  \"aiRationale\": \"สรุปเหตุผลสั้นกระชับว่าทำไมถึงกระทบหรือไม่กระทบเอกสารข้างต้น\"\n");
            promptBuilder.append("}\n");
            promptBuilder.append("หมายเหตุ: ในฟิลด์ retained*Ids ให้ใส่เฉพาะ UUID ของเอกสารที่เห็นว่า 'ได้รับผลกระทบจริง' จากรายการ Candidate ด้านบนเท่านั้น\n");

            String systemPrompt = "You are a professional software architect and impact analyzer. Output ONLY valid JSON matching the requested schema.";

            String aiRaw;
            if (attachments != null && !attachments.isEmpty()) {
                aiRaw = aiProviderService.generateRawResponse(promptBuilder.toString(), systemPrompt, modelId, attachments);
            } else if (modelId != null && !modelId.isBlank()) {
                aiRaw = aiProviderService.generateRawResponse(promptBuilder.toString(), systemPrompt, modelId);
            } else {
                aiRaw = aiProviderService.generateRawResponse(promptBuilder.toString(), systemPrompt);
            }

            if (aiRaw != null && !aiRaw.isBlank()) {
                parseAndApplyAiResult(response, aiRaw);
            }
        } catch (Exception e) {
            log.warn("AI semantic triage failed, preserving structural graph candidates: {}", e.getMessage());
            response.setAiRationale("วิเคราะห์โดย Traceability Graph (AI ไม่สามารถประมวลผลได้: " + e.getMessage() + ")");
        }
    }

    private void appendCandidates(StringBuilder sb, String label, List<ImpactAnalysisResponse.ImpactItem> items) {
        if (items == null || items.isEmpty()) return;
        sb.append("[").append(label).append("]\n");
        for (var item : items) {
            sb.append("- ID: ").append(item.getId())
              .append(", Code: ").append(item.getCode() != null ? item.getCode() : "-")
              .append(", Name: ").append(item.getName() != null ? item.getName() : "-")
              .append("\n");
        }
    }

    private void appendDiagramCandidates(StringBuilder sb, String label, List<ImpactAnalysisResponse.DiagramItem> items) {
        if (items == null || items.isEmpty()) return;
        sb.append("[").append(label).append("]\n");
        for (var item : items) {
            sb.append("- ID: ").append(item.getId())
              .append(", Type: ").append(item.getDiagramType() != null ? item.getDiagramType() : "-")
              .append(", Name: ").append(item.getName() != null ? item.getName() : "-")
              .append("\n");
        }
    }

    private void parseAndApplyAiResult(ImpactAnalysisResponse response, String aiRaw) {
        try {
            String cleanJson = aiRaw.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            } else if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            JsonNode root = objectMapper.readTree(cleanJson);
            if (root == null || !root.isObject()) {
                return;
            }

            if (root.has("mandayImpact") && root.get("mandayImpact").isInt()) {
                response.setMandayImpact(Math.max(1, root.get("mandayImpact").asInt()));
            }
            if (root.has("timelineImpact") && root.get("timelineImpact").isInt()) {
                response.setTimelineImpact(Math.max(1, root.get("timelineImpact").asInt()));
            }
            if (root.has("aiRationale") && !root.get("aiRationale").isNull()) {
                response.setAiRationale(root.get("aiRationale").asText());
            }

            // Filter retained candidates
            filterItemCandidates(root, "retainedRequirementIds", response.getImpactedRequirements(), response::setImpactedRequirements, response::setImpactedRequirementIds);
            filterItemCandidates(root, "retainedSpecIds", response.getImpactedSpecs(), response::setImpactedSpecs, response::setImpactedSpecIds);
            filterItemCandidates(root, "retainedTaskIds", response.getImpactedTasks(), response::setImpactedTasks, response::setImpactedTaskIds);
            filterItemCandidates(root, "retainedTestCaseIds", response.getImpactedTestCases(), response::setImpactedTestCases, response::setImpactedTestCaseIds);
            filterItemCandidates(root, "retainedBugIds", response.getImpactedBugs(), response::setImpactedBugs, response::setImpactedBugIds);
            filterItemCandidates(root, "retainedManualIds", response.getImpactedManuals(), response::setImpactedManuals, response::setImpactedManualIds);
            filterItemCandidates(root, "retainedDeliveryIds", response.getImpactedDeliveries(), response::setImpactedDeliveries, response::setImpactedDeliveryIds);
            filterItemCandidates(root, "retainedInvoiceIds", response.getImpactedInvoices(), response::setImpactedInvoices, response::setImpactedInvoiceIds);
            filterItemCandidates(root, "retainedMaTicketIds", response.getImpactedMaTickets(), response::setImpactedMaTickets, response::setImpactedMaTicketIds);

            if (root.has("retainedDiagramIds") && root.get("retainedDiagramIds").isArray() && response.getImpactedDiagrams() != null) {
                Set<UUID> retained = extractUuidSet(root.get("retainedDiagramIds"));
                List<ImpactAnalysisResponse.DiagramItem> filtered = response.getImpactedDiagrams().stream()
                        .filter(d -> retained.contains(d.getId()))
                        .toList();
                response.setImpactedDiagrams(filtered);
                response.setImpactedDiagramIds(filtered.stream().map(ImpactAnalysisResponse.DiagramItem::getId).toArray(UUID[]::new));
            }

            response.setAnalysisStatus("AI");
        } catch (Exception e) {
            log.warn("Failed to parse AI JSON response: {}", e.getMessage());
            response.setAiRationale("ผลวิเคราะห์จาก Traceability Graph (ไม่สามารถแปลงคำตอบ AI: " + e.getMessage() + ")");
        }
    }

    private void filterItemCandidates(JsonNode root, String key,
                                       List<ImpactAnalysisResponse.ImpactItem> originalList,
                                       java.util.function.Consumer<List<ImpactAnalysisResponse.ImpactItem>> listSetter,
                                       java.util.function.Consumer<UUID[]> idSetter) {
        if (!root.has(key) || !root.get(key).isArray() || originalList == null) return;
        Set<UUID> retained = extractUuidSet(root.get(key));
        List<ImpactAnalysisResponse.ImpactItem> filtered = originalList.stream()
                .filter(item -> retained.contains(item.getId()))
                .toList();
        listSetter.accept(filtered);
        idSetter.accept(filtered.stream().map(ImpactAnalysisResponse.ImpactItem::getId).toArray(UUID[]::new));
    }

    private Set<UUID> extractUuidSet(JsonNode arrayNode) {
        Set<UUID> result = new HashSet<>();
        if (arrayNode == null || !arrayNode.isArray()) return result;
        for (JsonNode n : arrayNode) {
            try {
                if (n.isTextual()) {
                    result.add(UUID.fromString(n.asText().trim()));
                }
            } catch (Exception ignored) {}
        }
        return result;
    }

    private void recordHistory(ChangeImpactAnalysis analysis) {
        if (analysis == null || analysis.getChangeRequest() == null || historyRepository == null) {
            return;
        }
        try {
            UUID crId = analysis.getChangeRequest().getId();
            int nextVersion = historyRepository.findMaxVersionNoByChangeRequestId(crId) + 1;

            ChangeImpactAnalysisHistory history = new ChangeImpactAnalysisHistory();
            history.setChangeRequest(analysis.getChangeRequest());
            history.setAnalysisId(analysis.getId());
            history.setAnalysisStatus(analysis.getAnalysisStatus() != null ? analysis.getAnalysisStatus() : "MANUAL");
            history.setVersionNo(nextVersion);
            history.setMandayImpact(analysis.getMandayImpact());
            history.setTimelineImpact(analysis.getTimelineImpact());
            history.setDfdImpact(analysis.getDfdImpact());
            history.setErImpact(analysis.getErImpact());
            history.setUiImpact(analysis.getUiImpact());
            history.setApiImpact(analysis.getApiImpact());
            history.setTestImpact(analysis.getTestImpact());
            history.setCostImpact(analysis.getCostImpact());
            history.setAiRationale(analysis.getAiRationale());
            history.setImpactedRequirementIds(analysis.getImpactedRequirementIds());
            history.setImpactedSpecIds(analysis.getImpactedSpecIds());
            history.setImpactedTaskIds(analysis.getImpactedTaskIds());
            history.setImpactedTestCaseIds(analysis.getImpactedTestCaseIds());
            history.setImpactedBugIds(analysis.getImpactedBugIds());
            history.setImpactedDiagramIds(analysis.getImpactedDiagramIds());
            history.setImpactedTableNames(analysis.getImpactedTableNames());
            history.setImpactedProjectIds(analysis.getImpactedProjectIds());
            history.setImpactedCustomerIds(analysis.getImpactedCustomerIds());
            history.setAnalyzedAt(analysis.getAnalyzedAt() != null ? analysis.getAnalyzedAt() : Instant.now());
            history.setAnalyzedBy(analysis.getAnalyzedBy());

            historyRepository.save(history);
            log.info("Recorded impact analysis history (version {}) for change request: {}", nextVersion, crId);
        } catch (Exception e) {
            log.error("Failed to record impact analysis history for change request: {}", analysis.getChangeRequest().getId(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ImpactAnalysisHistoryResponse> getHistory(UUID changeRequestId) {
        if (changeRequestId == null || historyRepository == null) {
            return List.of();
        }
        return historyRepository.findByChangeRequestIdAndIsDeleteFalseOrderByCreatedDateDesc(changeRequestId)
                .stream()
                .map(this::toHistoryResponse)
                .toList();
    }

    private ImpactAnalysisHistoryResponse toHistoryResponse(ChangeImpactAnalysisHistory h) {
        ImpactAnalysisHistoryResponse resp = new ImpactAnalysisHistoryResponse();
        resp.setId(h.getId());
        if (h.getChangeRequest() != null) {
            resp.setChangeRequestId(h.getChangeRequest().getId());
        }
        resp.setAnalysisId(h.getAnalysisId());
        resp.setAnalysisStatus(h.getAnalysisStatus());
        resp.setVersionNo(h.getVersionNo());
        resp.setMandayImpact(h.getMandayImpact());
        resp.setTimelineImpact(h.getTimelineImpact());
        resp.setAiRationale(h.getAiRationale());
        resp.setAnalyzedAt(h.getAnalyzedAt());
        resp.setAnalyzedBy(h.getAnalyzedBy());
        resp.setCreatedDate(h.getCreatedDate());

        resp.setRequirementCount(h.getImpactedRequirementIds() != null ? h.getImpactedRequirementIds().length : 0);
        resp.setSpecCount(h.getImpactedSpecIds() != null ? h.getImpactedSpecIds().length : 0);
        resp.setDiagramCount(h.getImpactedDiagramIds() != null ? h.getImpactedDiagramIds().length : 0);
        resp.setTaskCount(h.getImpactedTaskIds() != null ? h.getImpactedTaskIds().length : 0);
        resp.setTestCaseCount(h.getImpactedTestCaseIds() != null ? h.getImpactedTestCaseIds().length : 0);
        resp.setBugCount(h.getImpactedBugIds() != null ? h.getImpactedBugIds().length : 0);
        resp.setProjectCount(h.getImpactedProjectIds() != null ? h.getImpactedProjectIds().length : 0);
        resp.setCustomerCount(h.getImpactedCustomerIds() != null ? h.getImpactedCustomerIds().length : 0);

        // Hydrate dummy entity to reuse toResponse for full name resolving
        ChangeImpactAnalysis dummy = new ChangeImpactAnalysis();
        dummy.setId(h.getAnalysisId() != null ? h.getAnalysisId() : h.getId());
        dummy.setChangeRequest(h.getChangeRequest());
        dummy.setAnalysisStatus(h.getAnalysisStatus());
        dummy.setMandayImpact(h.getMandayImpact());
        dummy.setTimelineImpact(h.getTimelineImpact());
        dummy.setDfdImpact(h.getDfdImpact());
        dummy.setErImpact(h.getErImpact());
        dummy.setUiImpact(h.getUiImpact());
        dummy.setApiImpact(h.getApiImpact());
        dummy.setTestImpact(h.getTestImpact());
        dummy.setCostImpact(h.getCostImpact());
        dummy.setAiRationale(h.getAiRationale());
        dummy.setImpactedRequirementIds(h.getImpactedRequirementIds());
        dummy.setImpactedSpecIds(h.getImpactedSpecIds());
        dummy.setImpactedTaskIds(h.getImpactedTaskIds());
        dummy.setImpactedTestCaseIds(h.getImpactedTestCaseIds());
        dummy.setImpactedBugIds(h.getImpactedBugIds());
        dummy.setImpactedDiagramIds(h.getImpactedDiagramIds());
        dummy.setImpactedTableNames(h.getImpactedTableNames());
        dummy.setImpactedProjectIds(h.getImpactedProjectIds());
        dummy.setImpactedCustomerIds(h.getImpactedCustomerIds());
        dummy.setAnalyzedAt(h.getAnalyzedAt());
        dummy.setAnalyzedBy(h.getAnalyzedBy());

        ImpactAnalysisResponse snapshot = toResponse(dummy);
        resp.setSnapshot(snapshot);
        return resp;
    }

    @Override
    @Transactional
    public ImpactAnalysisResponse restoreHistory(UUID historyId) {
        ChangeImpactAnalysisHistory h = historyRepository.findById(historyId)
                .orElseThrow(() -> new ResourceNotFoundException("Impact Analysis History not found"));

        UUID crId = h.getChangeRequest().getId();
        ChangeImpactAnalysis analysis = repository.findByChangeRequestId(crId)
                .orElse(new ChangeImpactAnalysis());

        analysis.setChangeRequest(h.getChangeRequest());
        analysis.setAnalysisStatus(h.getAnalysisStatus());
        analysis.setMandayImpact(h.getMandayImpact());
        analysis.setTimelineImpact(h.getTimelineImpact());
        analysis.setDfdImpact(h.getDfdImpact());
        analysis.setErImpact(h.getErImpact());
        analysis.setUiImpact(h.getUiImpact());
        analysis.setApiImpact(h.getApiImpact());
        analysis.setTestImpact(h.getTestImpact());
        analysis.setCostImpact(h.getCostImpact());
        analysis.setAiRationale(h.getAiRationale());
        analysis.setImpactedRequirementIds(h.getImpactedRequirementIds());
        analysis.setImpactedSpecIds(h.getImpactedSpecIds());
        analysis.setImpactedTaskIds(h.getImpactedTaskIds());
        analysis.setImpactedTestCaseIds(h.getImpactedTestCaseIds());
        analysis.setImpactedBugIds(h.getImpactedBugIds());
        analysis.setImpactedDiagramIds(h.getImpactedDiagramIds());
        analysis.setImpactedTableNames(h.getImpactedTableNames());
        analysis.setImpactedProjectIds(h.getImpactedProjectIds());
        analysis.setImpactedCustomerIds(h.getImpactedCustomerIds());
        analysis.setAnalyzedAt(Instant.now());
        if (currentUserService != null) {
            try {
                analysis.setAnalyzedBy(currentUserService.getUserId());
            } catch (Exception ignored) {}
        }

        ChangeImpactAnalysis saved = repository.save(analysis);
        recordHistory(saved);
        log.info("Restored impact analysis from history {} (version {}) for CR {}", historyId, h.getVersionNo(), crId);

        return toResponse(saved);
    }
}