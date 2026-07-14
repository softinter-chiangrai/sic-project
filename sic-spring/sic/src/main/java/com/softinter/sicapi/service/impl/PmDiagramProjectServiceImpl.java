package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmDiagramProjectRequest;
import com.softinter.sicapi.dto.response.PmDiagramProjectResponse;
import com.softinter.sicapi.entity.pm.PmDiagramProject;
import com.softinter.sicapi.repository.pm.PmDiagramProjectRepository;
import com.softinter.sicapi.repository.pm.PmDiagramTabRepository;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmDiagramProjectService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PmDiagramProjectServiceImpl implements PmDiagramProjectService {

    private final PmDiagramProjectRepository projectRepository;
    private final PmDiagramTabRepository tabRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional(readOnly = true)
    public List<PmDiagramProjectResponse> getProjects() {
        String userId = currentUserService.getUserId();
        return projectRepository.findByUserIdAndIsDeleteFalseOrderByLastOpenedDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PmDiagramProjectResponse getProject(UUID id) {
        PmDiagramProject project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return toResponse(project);
    }

    @Override
    @Transactional
    public PmDiagramProjectResponse createProject(PmDiagramProjectRequest request) {
        String userId = currentUserService.getUserId();
        UUID businessId = BusinessContextHolder.getBusinessId();

        if (projectRepository.existsByUserIdAndNameAndIsDeleteFalse(userId, request.getName())) {
            throw new RuntimeException("Project name already exists");
        }

        PmDiagramProject project = new PmDiagramProject();
        project.setUserId(userId);
        project.setBusinessId(businessId);
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setIsFavorite(request.getIsFavorite() != null ? request.getIsFavorite() : false);
        project.setLastOpened(Instant.now());

        PmDiagramProject saved = projectRepository.save(project);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public PmDiagramProjectResponse updateProject(UUID id, PmDiagramProjectRequest request) {
        PmDiagramProject project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (request.getName() != null) {
            project.setName(request.getName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getIsFavorite() != null) {
            project.setIsFavorite(request.getIsFavorite());
        }
        project.setLastOpened(Instant.now());

        PmDiagramProject saved = projectRepository.save(project);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteProject(UUID id) {
        PmDiagramProject project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        project.setIsDelete(true);
        project.setDeleteDate(Instant.now());
        projectRepository.save(project);
    }

    @Override
    @Transactional
    public PmDiagramProjectResponse toggleFavorite(UUID id) {
        PmDiagramProject project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        project.setIsFavorite(!project.getIsFavorite());
        project.setLastOpened(Instant.now());
        return toResponse(projectRepository.save(project));
    }

    private PmDiagramProjectResponse toResponse(PmDiagramProject project) {
        PmDiagramProjectResponse dto = new PmDiagramProjectResponse();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setIsFavorite(project.getIsFavorite());
        dto.setLastOpened(project.getLastOpened());
        dto.setCreatedDate(project.getCreatedDate());
        dto.setUpdatedDate(project.getUpdatedDate());

        int tabCount = tabRepository.countByProjectIdAndIsDeleteFalse(project.getId());
        dto.setTabCount(tabCount);

        return dto;
    }
}