package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.DocumentVersionRequest;
import com.softinter.sicapi.dto.response.DocumentVersionResponse;

import java.util.List;
import java.util.UUID;

public interface DocumentVersionService {

    // ===== Core CRUD =====
    List<DocumentVersionResponse> getVersions(String documentType, UUID documentId);

    DocumentVersionResponse getVersion(UUID id);

    UUID saveVersion(DocumentVersionRequest request);

    void deleteVersion(UUID id);

    void activateVersion(UUID id);

    // ===== Bulk Operations =====
    void deleteVersionsByDocument(String documentType, UUID documentId);

    // ===== Helper Methods =====
    void createVersion(String documentType, UUID documentId, String versionNo, String changeSummary);

    String incrementVersion(String currentVersion);

    boolean isVersionExists(String documentType, UUID documentId);
}