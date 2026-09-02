package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.DocumentVersionRequest;
import com.softinter.sicapi.dto.response.DocumentVersionResponse;

import java.util.List;
import java.util.UUID;

public interface DocumentVersionService {

    // ===== Core CRUD =====
    List<DocumentVersionResponse> getVersions(String documentType, UUID documentId);

    List<DocumentVersionResponse> getVersionsByProject(UUID projectId, String documentType);

    DocumentVersionResponse getVersion(UUID id);

    UUID saveVersion(DocumentVersionRequest request);

    void deleteVersion(UUID id);

    void activateVersion(UUID id);

    // ===== Bulk Operations =====
    void deleteVersionsByDocument(String documentType, UUID documentId);

    // ===== Helper Methods =====
    void createVersion(String documentType, UUID documentId, String versionNo, String changeSummary);

    void createVersion(String documentType, UUID documentId, UUID projectId, String documentCode, String versionNo, String changeSummary);

    void createVersion(String documentType, UUID documentId, UUID projectId, String documentCode, String versionNo, String changeSummary, String snapshotData);

    void createVersion(String documentType, UUID documentId, UUID projectId, String documentCode, String versionNo, String changeSummary, String snapshotData, UUID fileRefId, String filePath);

    String incrementVersion(String currentVersion);

    String promoteToMajorVersion(String currentVersion);

    boolean isVersionExists(String documentType, UUID documentId);
}