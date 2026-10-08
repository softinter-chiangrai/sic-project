package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PmDiagramReorderRequest;
import com.softinter.sicapi.dto.request.PmDiagramTabRequest;
import com.softinter.sicapi.dto.response.PmDiagramTabResponse;
import com.softinter.sicapi.dto.response.PmDiagramVersionResponse;

import java.util.List;
import java.util.UUID;
import com.softinter.sicapi.dto.response.ComboboxResponse;

public interface PmDiagramTabService {

    List<PmDiagramTabResponse> getTabs(UUID projectId);

    List<PmDiagramTabResponse> getTabs(UUID projectId, String keyword);

    /** id ของ diagram ใน business นี้ที่ยังไม่มีรูป PNG */
    List<UUID> getIdsMissingImage();

    PmDiagramTabResponse getTab(UUID id);

    PmDiagramTabResponse createTab(PmDiagramTabRequest request);

    PmDiagramTabResponse updateTab(UUID id, PmDiagramTabRequest request);

    void deleteTab(UUID id);

    PmDiagramTabResponse duplicateTab(UUID id);

    void reorderTabs(PmDiagramReorderRequest request);

    List<PmDiagramVersionResponse> getVersions(UUID tabId);

    PmDiagramTabResponse restoreVersion(UUID tabId, UUID versionId);

    List<ComboboxResponse> getComboboxDiagrams(UUID projectId);
}