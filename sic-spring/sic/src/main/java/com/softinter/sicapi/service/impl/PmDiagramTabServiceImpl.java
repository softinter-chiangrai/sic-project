package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmDiagramReorderRequest;
import com.softinter.sicapi.dto.request.PmDiagramTabRequest;
import com.softinter.sicapi.dto.response.PmDiagramTabResponse;
import com.softinter.sicapi.dto.response.PmDiagramVersionResponse;
import com.softinter.sicapi.entity.pm.PmDiagramProject;
import com.softinter.sicapi.entity.pm.PmDiagramTab;
import com.softinter.sicapi.entity.pm.PmDiagramVersion;
import com.softinter.sicapi.repository.pm.PmDiagramProjectRepository;
import com.softinter.sicapi.repository.pm.PmDiagramTabRepository;
import com.softinter.sicapi.repository.pm.PmDiagramVersionRepository;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmDiagramTabService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PmDiagramTabServiceImpl implements PmDiagramTabService {

    private final PmDiagramTabRepository tabRepository;
    private final PmDiagramProjectRepository projectRepository;
    private final PmDiagramVersionRepository versionRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional(readOnly = true)
    public List<PmDiagramTabResponse> getTabs(UUID projectId) {
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

        PmDiagramProject project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Calculate next sort order
        List<PmDiagramTab> existing = tabRepository.findByProjectIdAndIsDeleteFalseOrderBySortOrderAscCreatedDateAsc(
                request.getProjectId()
        );
        int maxSort = existing.isEmpty() ? 0 : existing.stream().mapToInt(PmDiagramTab::getSortOrder).max().orElse(0);

        PmDiagramTab tab = new PmDiagramTab();
        tab.setUserId(userId);
        tab.setBusinessId(businessId);
        tab.setProject(project);
        tab.setName(request.getName());
        tab.setDiagramType(request.getDiagramType());
        tab.setMermaidScript(request.getMermaidScript());
        tab.setMetadata(request.getMetadata());
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
        duplicate.setProject(original.getProject());
        duplicate.setName(original.getName() + " (Copy)");
        duplicate.setDiagramType(original.getDiagramType());
        duplicate.setMermaidScript(original.getMermaidScript());
        duplicate.setMetadata(original.getMetadata());
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

    // ------------------------------------------------------------------------
    // Helper methods
    // ------------------------------------------------------------------------

    private void createVersion(PmDiagramTab tab, String comment) {
        int versionCount = versionRepository.countByDiagramIdAndIsDeleteFalse(tab.getId());
        int nextVersion = versionCount + 1;

        // Limit to 50 versions to prevent bloat
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
        PmDiagramTabResponse dto = new PmDiagramTabResponse();
        dto.setId(tab.getId());
        dto.setName(tab.getName());
        dto.setDiagramType(tab.getDiagramType());
        dto.setMermaidScript(tab.getMermaidScript());
        dto.setMetadata(tab.getMetadata());
        dto.setProjectId(tab.getProject().getId());
        dto.setProjectName(tab.getProject().getName());
        dto.setSortOrder(tab.getSortOrder());
        dto.setIsActive(tab.getIsActive());
        dto.setCreatedDate(tab.getCreatedDate());
        dto.setUpdatedDate(tab.getUpdatedDate());

        int versionCount = versionRepository.countByDiagramIdAndIsDeleteFalse(tab.getId());
        dto.setVersionCount(versionCount);

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