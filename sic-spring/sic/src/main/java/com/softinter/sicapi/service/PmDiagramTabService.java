package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PmDiagramReorderRequest;
import com.softinter.sicapi.dto.request.PmDiagramTabRequest;
import com.softinter.sicapi.dto.response.PmDiagramTabResponse;
import com.softinter.sicapi.dto.response.PmDiagramVersionResponse;

import java.util.List;
import java.util.UUID;

public interface PmDiagramTabService {

    List<PmDiagramTabResponse> getTabs(UUID projectId);

    PmDiagramTabResponse getTab(UUID id);

    PmDiagramTabResponse createTab(PmDiagramTabRequest request);

    PmDiagramTabResponse updateTab(UUID id, PmDiagramTabRequest request);

    void deleteTab(UUID id);

    PmDiagramTabResponse duplicateTab(UUID id);

    void reorderTabs(PmDiagramReorderRequest request);

    List<PmDiagramVersionResponse> getVersions(UUID tabId);

    PmDiagramTabResponse restoreVersion(UUID tabId, UUID versionId);
}