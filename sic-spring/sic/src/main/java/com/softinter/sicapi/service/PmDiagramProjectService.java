package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PmDiagramProjectRequest;
import com.softinter.sicapi.dto.response.PmDiagramProjectResponse;

import java.util.List;
import java.util.UUID;

public interface PmDiagramProjectService {

    List<PmDiagramProjectResponse> getProjects();

    PmDiagramProjectResponse getProject(UUID id);

    PmDiagramProjectResponse createProject(PmDiagramProjectRequest request);

    PmDiagramProjectResponse updateProject(UUID id, PmDiagramProjectRequest request);

    void deleteProject(UUID id);

    PmDiagramProjectResponse toggleFavorite(UUID id);
}