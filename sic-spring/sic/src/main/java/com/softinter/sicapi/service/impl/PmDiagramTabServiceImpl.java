package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmDiagramReorderRequest;
import com.softinter.sicapi.dto.request.PmDiagramTabRequest;
import com.softinter.sicapi.dto.response.PmDiagramTabResponse;
import com.softinter.sicapi.dto.response.PmDiagramVersionResponse;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.enums.TraceRelationship;
import com.softinter.sicapi.entity.pm.PmDiagramTab;
import com.softinter.sicapi.entity.pm.PmDiagramVersion;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.entity.pm.PmTraceLink;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmDiagramTabRepository;
import com.softinter.sicapi.repository.pm.PmDiagramVersionRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmTraceLinkRepository;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmDiagramTabService;
import com.softinter.sicapi.service.TraceLinkService;
import com.softinter.sicapi.service.EditSessionService;
import com.softinter.sicapi.service.DocumentVersionService;
import com.softinter.sicapi.util.DocumentDiffHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmDiagramTabServiceImpl implements PmDiagramTabService {

    private final PmDiagramTabRepository tabRepository;
    private final PmDiagramVersionRepository versionRepository;
    private final CurrentUserService currentUserService;
    private final PmCustomerProjectRepository customerProjectRepository;
    private final PmRequirementRepository requirementRepository;
    private final TraceLinkService traceLinkService;
    private final PmTraceLinkRepository traceLinkRepository;
    private final EditSessionService editSessionService;
    private final DocumentVersionService documentVersionService;

    // ===== CREATE =====
    @Override
    @Transactional
    public PmDiagramTabResponse createTab(PmDiagramTabRequest request) {
        // 1. Validate Project
        if (!customerProjectRepository.existsById(request.getProjectId())) {
            throw new RuntimeException("Project not found: " + request.getProjectId());
        }

        // 2. Validate Requirement (บังคับ)
        if (request.getRequirementId() == null) {
            throw new IllegalArgumentException("Requirement ID is required for traceability.");
        }
        PmRequirement requirement = requirementRepository.findById(request.getRequirementId())
                .orElseThrow(() -> new RuntimeException("Requirement not found: " + request.getRequirementId()));

        // 3. สร้าง Diagram
        String userId = currentUserService.getUserId();
        UUID businessId = BusinessContextHolder.getBusinessId();

        List<PmDiagramTab> existing = tabRepository.findByProjectIdAndIsDeleteFalseOrderBySortOrderAscCreatedDateAsc(
                request.getProjectId()
        );
        int maxSort = existing.isEmpty() ? 0 : existing.stream().mapToInt(PmDiagramTab::getSortOrder).max().orElse(0);

        PmDiagramTab tab = new PmDiagramTab();
        tab.setUserId(userId);
        tab.setBusinessId(businessId);
        tab.setProjectId(request.getProjectId());
        tab.setName(request.getName());
        tab.setDiagramType(request.getDiagramType());
        tab.setMermaidScript(request.getMermaidScript() != null ? request.getMermaidScript() : "");
        tab.setMetadata(request.getMetadata());
        tab.setGraphData(request.getGraphData());
        tab.setSortOrder(maxSort + 1);
        tab.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        PmDiagramTab saved = tabRepository.save(tab);
        createVersion(saved, "Initial version");

        // 4. สร้าง Trace Link: Requirement → Diagram
        String diagramType = request.getDiagramType().toUpperCase();
        traceLinkService.createLink(
                request.getProjectId(),
                "REQUIREMENT", request.getRequirementId(),
                diagramType, saved.getId(),
                TraceRelationship.DESIGNED_BY
        );
        traceLinkService.createLink(
                request.getProjectId(),
                "REQUIREMENT", request.getRequirementId(),
                "DIAGRAM", saved.getId(),
                TraceRelationship.DESIGNED_BY
        );

        // 5. สร้าง Trace Link เพิ่มเติม (ถ้ามี relatedRequirementIds)
        if (request.getRelatedRequirementIds() != null) {
            for (UUID reqId : request.getRelatedRequirementIds()) {
                if (reqId.equals(request.getRequirementId())) {
                    continue;
                }
                if (requirementRepository.existsById(reqId)) {
                    traceLinkService.createLink(
                            request.getProjectId(),
                            "REQUIREMENT", reqId,
                            diagramType, saved.getId(),
                            TraceRelationship.DESIGNED_BY
                    );
                    traceLinkService.createLink(
                            request.getProjectId(),
                            "REQUIREMENT", reqId,
                            "DIAGRAM", saved.getId(),
                            TraceRelationship.DESIGNED_BY
                    );
                }
            }
        }

        // 6. DFD → เชื่อมกับ DFD อื่นๆ (ถ้ามี)
        if ("DFD".equals(diagramType) && request.getRelatedDfdIds() != null) {
            for (UUID dfdId : request.getRelatedDfdIds()) {
                traceLinkService.createLink(
                        request.getProjectId(),
                        "DFD", dfdId,
                        "DFD", saved.getId(),
                        TraceRelationship.RELATED_TO
                );
            }
        }

        // 7. ER → เชื่อมกับ DFD และ Requirement (ถ้ามี)
        if ("ER".equals(diagramType)) {
            if (request.getRelatedDfdIds() != null) {
                for (UUID dfdId : request.getRelatedDfdIds()) {
                    traceLinkService.createLink(
                            request.getProjectId(),
                            "DFD", dfdId,
                            "ER", saved.getId(),
                            TraceRelationship.IMPLEMENTED_BY
                    );
                }
            }
            if (request.getRelatedRequirementIdsForEr() != null) {
                for (UUID reqId : request.getRelatedRequirementIdsForEr()) {
                    if (requirementRepository.existsById(reqId)) {
                        traceLinkService.createLink(
                                request.getProjectId(),
                                "REQUIREMENT", reqId,
                                "ER", saved.getId(),
                                TraceRelationship.DESIGNED_BY
                        );
                    }
                }
            }
        }

        // ✅ Create document version
        documentVersionService.createVersion(
                diagramType,
                saved.getId(),
                saved.getProjectId(),
                saved.getName(),
                "v1.0",
                "Initial version"
        );

        return toResponse(saved);
    }

    // ===== UPDATE =====
    @Override
    @Transactional
    public PmDiagramTabResponse updateTab(UUID id, PmDiagramTabRequest request) {
        PmDiagramTab tab = tabRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tab not found: " + id));

        // ตรวจสอบว่ามี requirementId หรือไม่ (ถ้ามีให้อัปเดต)
        if (request.getRequirementId() != null) {
            // ตรวจสอบว่า Requirement มีอยู่จริง
            PmRequirement requirement = requirementRepository.findById(request.getRequirementId())
                    .orElseThrow(() -> new RuntimeException("Requirement not found: " + request.getRequirementId()));

            // สร้าง Trace Link ใหม่
            String diagramType = tab.getDiagramType().toUpperCase();
            traceLinkService.createLink(
                    tab.getProjectId(),
                    "REQUIREMENT", request.getRequirementId(),
                    diagramType, tab.getId(),
                    TraceRelationship.DESIGNED_BY
            );
            traceLinkService.createLink(
                    tab.getProjectId(),
                    "REQUIREMENT", request.getRequirementId(),
                    "DIAGRAM", tab.getId(),
                    TraceRelationship.DESIGNED_BY
            );
        }

        // อัปเดตข้อมูล Diagram
        EntityState state = request.getState() != null ? EntityState.values()[request.getState()] : EntityState.MODIFIED;

        if (state == EntityState.MODIFIED) {
            String userId = currentUserService.getUserId();
            String diagramType = tab.getDiagramType().toUpperCase();
            if (!editSessionService.canEdit(diagramType, tab.getId(), userId)) {
                throw new IllegalStateException("This diagram is locked. A Change Request is required to edit it.");
            }

            if (request.getRowVersion() != null && request.getRowVersion() != 0 && !request.getRowVersion().equals(tab.getRowVersion())) {
                if (request.getGraphData() == null && request.getMermaidScript() == null) {
                    throw new RuntimeException("Record has been modified by another user. Please refresh and try again.");
                } else {
                    log.warn("[PmDiagramTab] RowVersion mismatch during diagram auto-save (req: {}, db: {}). Updating diagram...", request.getRowVersion(), tab.getRowVersion());
                }
            }

            if (request.getProjectId() != null && !tab.getProjectId().equals(request.getProjectId())) {
                throw new IllegalArgumentException("Diagram does not belong to the specified project ID");
            }

            String oldVersion = getCurrentVersion(tab);

            // ✅ Auto Diff Detection
            List<String> changes = new ArrayList<>();
            DocumentDiffHelper.checkChange(changes, "ชื่อแท็บ (Name)", tab.getName(), request.getName());
            DocumentDiffHelper.checkChange(changes, "Mermaid Script", tab.getMermaidScript(), request.getMermaidScript());
            DocumentDiffHelper.checkChange(changes, "Graph Data", tab.getGraphData(), request.getGraphData());
            String diffSummary = DocumentDiffHelper.buildDiffSummary(changes, "อัปเดตไดอะแกรม " + (request.getName() != null ? request.getName() : tab.getName()));

            if (request.getName() != null) {
                tab.setName(request.getName());
            }
            if (request.getDiagramType() != null) {
                tab.setDiagramType(request.getDiagramType());
            }
            if (request.getMermaidScript() != null) {
                tab.setMermaidScript(request.getMermaidScript());
            }
            if (request.getMetadata() != null) {
                tab.setMetadata(request.getMetadata());
            }
            if (request.getGraphData() != null) {
                tab.setGraphData(request.getGraphData());
            }
            if (request.getIsActive() != null) {
                tab.setIsActive(request.getIsActive());
            }

            PmDiagramTab saved = tabRepository.save(tab);

            // Snapshot data
            String snapshotJson = null;
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                snapshotJson = mapper.writeValueAsString(saved);
            } catch (Exception ignored) {}

            // ✅ Create document version
            String newVersion = documentVersionService.incrementVersion(oldVersion);
            documentVersionService.createVersion(
                    saved.getDiagramType().toUpperCase(),
                    saved.getId(),
                    saved.getProjectId(),
                    saved.getName(),
                    newVersion,
                    diffSummary,
                    snapshotJson
            );

            return toResponse(saved);

        } else if (state == EntityState.DELETED) {
            tab.setIsDelete(true);
            tab.setDeleteDate(Instant.now());
            tabRepository.save(tab);
            
            // ✅ Soft delete all versions
            documentVersionService.deleteVersionsByDocument(
                    tab.getDiagramType().toUpperCase(),
                    tab.getId()
            );
            return toResponse(tab);
        }

        return toResponse(tab);
    }

    // ===== DELETE =====
    @Override
    @Transactional
    public void deleteTab(UUID id) {
        PmDiagramTab tab = tabRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tab not found: " + id));

        // ✅ 1. Soft delete Trace Links ที่เกี่ยวข้องกับ Diagram นี้ (ทั้งที่เป็น source และ target)
        // ลบ Trace Link ที่มี Diagram นี้เป็น Source
        List<PmTraceLink> sourceLinks = traceLinkRepository.findBySourceTypeAndSourceId(
                tab.getDiagramType().toUpperCase(), tab.getId()
        );
        for (PmTraceLink link : sourceLinks) {
            link.setIsDelete(true);
            link.setDeleteBy(currentUserService.getUserId());
            link.setDeleteDate(Instant.now());
            traceLinkRepository.save(link);
        }

        // ลบ Trace Link ที่มี Diagram นี้เป็น Target
        List<PmTraceLink> targetLinks = traceLinkRepository.findByTargetTypeAndTargetId(
                tab.getDiagramType().toUpperCase(), tab.getId()
        );
        for (PmTraceLink link : targetLinks) {
            link.setIsDelete(true);
            link.setDeleteBy(currentUserService.getUserId());
            link.setDeleteDate(Instant.now());
            traceLinkRepository.save(link);
        }

        log.info("Soft deleted {} trace links for diagram id: {}", sourceLinks.size() + targetLinks.size(), id);

        // 2. Soft delete Diagram เอง
        tab.setIsDelete(true);
        tab.setDeleteDate(Instant.now());
        tabRepository.save(tab);

        // ✅ 3. Soft delete all versions
        documentVersionService.deleteVersionsByDocument(
                tab.getDiagramType().toUpperCase(),
                tab.getId()
        );
    }

    // ===== DUPLICATE =====
    @Override
    @Transactional
    public PmDiagramTabResponse duplicateTab(UUID id) {
        PmDiagramTab original = tabRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tab not found: " + id));

        PmDiagramTab duplicate = new PmDiagramTab();
        duplicate.setUserId(original.getUserId());
        duplicate.setBusinessId(original.getBusinessId());
        duplicate.setProjectId(original.getProjectId());
        duplicate.setName(original.getName() + " (Copy)");
        duplicate.setDiagramType(original.getDiagramType());
        duplicate.setMermaidScript(original.getMermaidScript());
        duplicate.setMetadata(original.getMetadata());
        duplicate.setGraphData(original.getGraphData());
        duplicate.setSortOrder(original.getSortOrder() + 1);
        duplicate.setIsActive(true);

        PmDiagramTab saved = tabRepository.save(duplicate);
        createVersion(saved, "Duplicated from " + original.getName());

        // TODO: คัดลอก Trace Links จากต้นฉบับ (ถ้าต้องการ)

        // ✅ Create document version
        documentVersionService.createVersion(
                saved.getDiagramType().toUpperCase(),
                saved.getId(),
                "v1.0",
                "Duplicated from " + original.getName()
        );

        return toResponse(saved);
    }

    // ===== REORDER =====
    @Override
    @Transactional
    public void reorderTabs(PmDiagramReorderRequest request) {
        for (PmDiagramReorderRequest.TabOrder order : request.getTabs()) {
            PmDiagramTab tab = tabRepository.findById(order.getId())
                    .orElseThrow(() -> new RuntimeException("Tab not found: " + order.getId()));
            tab.setSortOrder(order.getSortOrder());
            tabRepository.save(tab);
        }
    }

    // ===== GET =====
    @Override
    @Transactional(readOnly = true)
    public List<PmDiagramTabResponse> getTabs(UUID projectId) {
        try {
            String userId = currentUserService.getUserId();
            List<PmDiagramTab> tabs;
            if (projectId != null) {
                tabs = tabRepository.findByProjectIdAndIsDeleteFalseOrderBySortOrderAscCreatedDateAsc(projectId);
            } else {
                tabs = tabRepository.findByUserIdAndIsDeleteFalseOrderBySortOrderAscCreatedDateAsc(userId);
            }
            return tabs.stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error in getTabs for projectId: {}", projectId, e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PmDiagramTabResponse getTab(UUID id) {
        PmDiagramTab tab = tabRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tab not found: " + id));
        return toResponse(tab);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PmDiagramVersionResponse> getVersions(UUID tabId) {
        return versionRepository.findByDiagramIdAndIsDeleteFalseOrderByVersionNumberDesc(tabId)
                .stream()
                .map(this::toVersionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PmDiagramTabResponse restoreVersion(UUID tabId, UUID versionId) {
        PmDiagramVersion version = versionRepository.findById(versionId)
                .orElseThrow(() -> new RuntimeException("Version not found: " + versionId));

        PmDiagramTab tab = version.getDiagram();
        tab.setMermaidScript(version.getMermaidScript());

        PmDiagramTab saved = tabRepository.save(tab);
        createVersion(saved, "Restored from version " + version.getVersionNumber());

        // ✅ Create document version
        documentVersionService.createVersion(
                saved.getDiagramType().toUpperCase(),
                saved.getId(),
                "v" + version.getVersionNumber(),
                "Restored from version " + version.getVersionNumber()
        );

        return toResponse(saved);
    }

    // ============================================================
    // HELPER METHODS
    // ============================================================

    private void createVersion(PmDiagramTab tab, String comment) {
        int versionCount = versionRepository.countByDiagramIdAndIsDeleteFalse(tab.getId());
        int nextVersion = versionCount + 1;

        if (versionCount >= 50) {
            List<PmDiagramVersion> oldestVersions = versionRepository
                    .findByDiagramIdAndIsDeleteFalseOrderByVersionNumberDesc(tab.getId());
            if (!oldestVersions.isEmpty()) {
                PmDiagramVersion oldest = oldestVersions.get(oldestVersions.size() - 1);
                oldest.setIsDelete(true);
                versionRepository.save(oldest);
            }
        }

        PmDiagramVersion version = new PmDiagramVersion();
        version.setBusinessId(tab.getBusinessId());
        version.setDiagram(tab);
        version.setMermaidScript(tab.getMermaidScript() != null ? tab.getMermaidScript() : "");
        version.setVersionNumber(nextVersion);
        version.setChangeComment(comment);
        versionRepository.save(version);
    }

    private String getCurrentVersion(PmDiagramTab tab) {
        if (tab.getId() == null) return "v1.0";
        List<PmDiagramVersion> versions = versionRepository.findByDiagramIdAndIsDeleteFalseOrderByVersionNumberDesc(tab.getId());
        if (versions.isEmpty()) return "v1.0";
        return "v" + versions.get(0).getVersionNumber();
    }

    private PmDiagramTabResponse toResponse(PmDiagramTab tab) {
        PmDiagramTabResponse dto = new PmDiagramTabResponse();
        dto.setId(tab.getId());
        dto.setName(tab.getName());
        dto.setDiagramType(tab.getDiagramType());
        dto.setMermaidScript(tab.getMermaidScript() != null ? tab.getMermaidScript() : "");
        dto.setMetadata(tab.getMetadata());
        dto.setGraphData(tab.getGraphData());
        dto.setProjectId(tab.getProjectId());

        if (tab.getProjectId() != null) {
            customerProjectRepository.findById(tab.getProjectId())
                    .ifPresent(p -> dto.setProjectName(p.getProjectName()));
        }

        dto.setSortOrder(tab.getSortOrder());
        dto.setIsActive(tab.getIsActive());
        dto.setCreatedDate(tab.getCreatedDate());
        dto.setUpdatedDate(tab.getUpdatedDate());
        dto.setRowVersion(tab.getRowVersion());

        if (tab.getId() != null) {
            dto.setVersionCount(versionRepository.countByDiagramIdAndIsDeleteFalse(tab.getId()));
        } else {
            dto.setVersionCount(0);
        }

        return dto;
    }

    private PmDiagramVersionResponse toVersionResponse(PmDiagramVersion version) {
        PmDiagramVersionResponse dto = new PmDiagramVersionResponse();
        dto.setId(version.getId());
        dto.setDiagramId(version.getDiagram().getId());
        dto.setMermaidScript(version.getMermaidScript());
        dto.setVersionNumber(version.getVersionNumber());
        dto.setChangeComment(version.getChangeComment());
        dto.setCreatedBy(version.getCreatedBy());
        dto.setCreatedDate(version.getCreatedDate());
        return dto;
    }
}