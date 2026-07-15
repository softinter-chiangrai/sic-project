package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmDiagramReorderRequest;
import com.softinter.sicapi.dto.request.PmDiagramTabRequest;
import com.softinter.sicapi.dto.response.PmDiagramTabResponse;
import com.softinter.sicapi.dto.response.PmDiagramVersionResponse;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmDiagramTab;
import com.softinter.sicapi.entity.pm.PmDiagramVersion;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmDiagramTabRepository;
import com.softinter.sicapi.repository.pm.PmDiagramVersionRepository;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmDiagramTabService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmDiagramTabServiceImpl implements PmDiagramTabService {

    private final PmDiagramTabRepository tabRepository;
    private final PmDiagramVersionRepository versionRepository;
    private final PmCustomerProjectRepository customerProjectRepository;
    private final CurrentUserService currentUserService;

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
                .orElseThrow(() -> new RuntimeException("Tab not found"));
        return toResponse(tab);
    }

    @Override
    @Transactional
    public PmDiagramTabResponse createTab(PmDiagramTabRequest request) {
        String userId = currentUserService.getUserId();
        UUID businessId = BusinessContextHolder.getBusinessId();

        if (!customerProjectRepository.existsById(request.getProjectId())) {
            throw new RuntimeException("Project not found: " + request.getProjectId());
        }

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
        tab.setMermaidScript(request.getMermaidScript());
        tab.setMetadata(request.getMetadata());
        tab.setGraphData(request.getGraphData());
        tab.setSortOrder(maxSort + 1);
        tab.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        PmDiagramTab saved = tabRepository.save(tab);
        createVersion(saved, "Initial version");

        return toResponse(saved);
    }

    @Override
    @Transactional
    public PmDiagramTabResponse updateTab(UUID id, PmDiagramTabRequest request) {
        PmDiagramTab tab = tabRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tab not found"));

        if (request.getName() != null) {
            tab.setName(request.getName());
        }
        if (request.getDiagramType() != null) {
            tab.setDiagramType(request.getDiagramType());
        }
        if (request.getMermaidScript() != null) {
            tab.setMermaidScript(request.getMermaidScript());
            createVersion(tab, "Auto-save");
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
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteTab(UUID id) {
        PmDiagramTab tab = tabRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tab not found"));
        tab.setIsDelete(true);
        tab.setDeleteDate(Instant.now());
        tabRepository.save(tab);
    }

    @Override
    @Transactional
    public PmDiagramTabResponse duplicateTab(UUID id) {
        PmDiagramTab original = tabRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tab not found"));

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

        return toResponse(saved);
    }

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
                .orElseThrow(() -> new RuntimeException("Version not found"));

        PmDiagramTab tab = version.getDiagram();
        tab.setMermaidScript(version.getMermaidScript());

        PmDiagramTab saved = tabRepository.save(tab);
        createVersion(saved, "Restored from version " + version.getVersionNumber());

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
        version.setMermaidScript(tab.getMermaidScript());
        version.setVersionNumber(nextVersion);
        version.setChangeComment(comment);
        versionRepository.save(version);
    }

    private PmDiagramTabResponse toResponse(PmDiagramTab tab) {
        try {
            PmDiagramTabResponse dto = new PmDiagramTabResponse();
            dto.setId(tab.getId());
            dto.setName(tab.getName());
            dto.setDiagramType(tab.getDiagramType());
            dto.setMermaidScript(tab.getMermaidScript());
            dto.setMetadata(tab.getMetadata());
            dto.setGraphData(tab.getGraphData());
            dto.setProjectId(tab.getProjectId());

            // ดึง projectName (ถ้ามี)
            try {
                customerProjectRepository.findById(tab.getProjectId())
                        .ifPresent(p -> dto.setProjectName(p.getProjectName()));
            } catch (Exception e) {
                log.warn("Could not fetch project name for projectId: {}", tab.getProjectId(), e);
                dto.setProjectName(null);
            }

            dto.setSortOrder(tab.getSortOrder());
            dto.setIsActive(tab.getIsActive());
            dto.setCreatedDate(tab.getCreatedDate());
            dto.setUpdatedDate(tab.getUpdatedDate());

            // ดึง version count
            try {
                dto.setVersionCount(versionRepository.countByDiagramIdAndIsDeleteFalse(tab.getId()));
            } catch (Exception e) {
                log.warn("Could not fetch version count for tabId: {}", tab.getId(), e);
                dto.setVersionCount(0);
            }

            return dto;
        } catch (Exception e) {
            log.error("Error mapping PmDiagramTab to response: {}", tab.getId(), e);
            // Fallback: ส่ง response แบบ minimal (ไม่มี projectName, versionCount)
            PmDiagramTabResponse fallback = new PmDiagramTabResponse();
            fallback.setId(tab.getId());
            fallback.setName(tab.getName());
            fallback.setDiagramType(tab.getDiagramType());
            fallback.setMermaidScript(tab.getMermaidScript());
            fallback.setMetadata(tab.getMetadata());
            fallback.setGraphData(tab.getGraphData());
            fallback.setProjectId(tab.getProjectId());
            fallback.setSortOrder(tab.getSortOrder());
            fallback.setIsActive(tab.getIsActive());
            fallback.setCreatedDate(tab.getCreatedDate());
            fallback.setUpdatedDate(tab.getUpdatedDate());
            fallback.setVersionCount(0);
            return fallback;
        }
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