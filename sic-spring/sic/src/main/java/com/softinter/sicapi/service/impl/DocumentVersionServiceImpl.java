package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.DocumentVersionRequest;
import com.softinter.sicapi.dto.response.DocumentVersionResponse;
import com.softinter.sicapi.entity.pm.PmDocumentVersion;
import com.softinter.sicapi.repository.pm.PmDocumentVersionRepository;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.service.BusinessAccessService;
import com.softinter.sicapi.service.DocumentVersionService;
import com.softinter.sicapi.util.LocalizationHelper;
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
public class DocumentVersionServiceImpl implements DocumentVersionService {

    private final PmDocumentVersionRepository versionRepository;
    private final BusinessAccessService businessAccessService;
    private final SuProfileRepository profileRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DocumentVersionResponse> getVersions(String documentType, UUID documentId) {
        return versionRepository
                .findByDocumentTypeAndDocumentIdOrderByCreatedDateDesc(documentType, documentId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentVersionResponse> getVersionsByProject(UUID projectId, String documentType) {
        List<PmDocumentVersion> list;
        if (documentType != null && !documentType.isBlank() && !"ALL".equalsIgnoreCase(documentType)) {
            list = versionRepository.findByProjectIdAndDocumentTypeAndIsDeleteFalseOrderByCreatedDateDesc(projectId, documentType);
        } else {
            list = versionRepository.findByProjectIdAndIsDeleteFalseOrderByCreatedDateDesc(projectId);
        }
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentVersionResponse getVersion(UUID id) {
        PmDocumentVersion version = versionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document version not found"));
        return toResponse(version);
    }

    @Override
    @Transactional
    public UUID saveVersion(DocumentVersionRequest request) {
        PmDocumentVersion version;
        if (request.getId() != null) {
            version = versionRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("Document version not found"));
            version.setVersionNo(request.getVersionNo());
            version.setChangeSummary(request.getChangeSummary());
            version.setFilePath(request.getFilePath());
            version.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
            version.setDocumentCode(request.getDocumentCode());
            version.setProjectId(request.getProjectId());
            version.setPreviousVersionId(request.getPreviousVersionId());
            version.setApprovalStatus(request.getApprovalStatus() != null ? request.getApprovalStatus() : "DRAFT");
            version.setApprovedBy(request.getApprovedBy());
            version.setApprovedDate(request.getApprovedDate());
            version.setSnapshotData(request.getSnapshotData());
            version.setFileRefId(request.getFileRefId());
        } else {
            version = new PmDocumentVersion();
            version.setDocumentType(request.getDocumentType());
            version.setDocumentId(request.getDocumentId());
            version.setDocumentCode(request.getDocumentCode());
            version.setProjectId(request.getProjectId());
            version.setBusinessId(businessAccessService.getBusinessId());
            version.setVersionNo(request.getVersionNo());
            version.setChangeSummary(request.getChangeSummary());
            version.setPreviousVersionId(request.getPreviousVersionId());
            version.setApprovalStatus(request.getApprovalStatus() != null ? request.getApprovalStatus() : "DRAFT");
            version.setApprovedBy(request.getApprovedBy());
            version.setApprovedDate(request.getApprovedDate());
            version.setSnapshotData(request.getSnapshotData());
            version.setFileRefId(request.getFileRefId());
            version.setFilePath(request.getFilePath());
            version.setIsActive(true);
        }
        version = versionRepository.save(version);
        return version.getId();
    }

    @Override
    @Transactional
    public void activateVersion(UUID id) {
        PmDocumentVersion target = versionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document version not found"));
        // Set all other versions of this document to isActive = false
        List<PmDocumentVersion> allVersions = versionRepository.findByDocumentTypeAndDocumentIdOrderByCreatedDateDesc(
                target.getDocumentType(), target.getDocumentId());
        for (PmDocumentVersion v : allVersions) {
            v.setIsActive(v.getId().equals(id));
            versionRepository.save(v);
        }
        log.info("Activated document version {} for document: {} - {}", id, target.getDocumentType(), target.getDocumentId());
    }

    @Override
    @Transactional
    public void deleteVersion(UUID id) {
        PmDocumentVersion version = versionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document version not found"));
        version.setIsActive(false);
        version.setIsDelete(true);
        version.setDeleteBy("system");
        version.setDeleteDate(Instant.now());
        versionRepository.save(version);
        log.info("Document version soft deleted: {}", id);
    }

    @Override
    @Transactional
    public void deleteVersionsByDocument(String documentType, UUID documentId) {
        List<PmDocumentVersion> versions = versionRepository
                .findByDocumentTypeAndDocumentIdOrderByCreatedDateDesc(documentType, documentId);
        for (PmDocumentVersion version : versions) {
            version.setIsActive(false);
            version.setIsDelete(true);
            version.setDeleteBy("system");
            version.setDeleteDate(Instant.now());
            versionRepository.save(version);
        }
        log.info("All versions deleted for document: {} - {}", documentType, documentId);
    }

    @Override
    @Transactional
    public void createVersion(String documentType, UUID documentId, String versionNo, String changeSummary) {
        createVersion(documentType, documentId, null, null, versionNo, changeSummary);
    }

    @Override
    @Transactional
    public void createVersion(String documentType, UUID documentId, UUID projectId, String documentCode, String versionNo, String changeSummary) {
        createVersion(documentType, documentId, projectId, documentCode, versionNo, changeSummary, null);
    }

    @Override
    @Transactional
    public void createVersion(String documentType, UUID documentId, UUID projectId, String documentCode, String versionNo, String changeSummary, String snapshotData) {
        UUID previousVersionId = versionRepository
                .findFirstByDocumentTypeAndDocumentIdAndIsDeleteFalseOrderByCreatedDateDesc(documentType, documentId)
                .map(PmDocumentVersion::getId)
                .orElse(null);

        PmDocumentVersion version = new PmDocumentVersion();
        version.setDocumentType(documentType);
        version.setDocumentId(documentId);
        version.setProjectId(projectId);
        version.setBusinessId(businessAccessService.getBusinessId());
        version.setDocumentCode(documentCode);
        version.setVersionNo(versionNo);
        version.setChangeSummary(changeSummary);
        version.setPreviousVersionId(previousVersionId);
        version.setSnapshotData(snapshotData);
        version.setIsActive(true);
        versionRepository.save(version);
        log.info("Document version created: {} - {} - Project: {} - Version: {} - PrevVersion: {}", 
                documentType, documentId, projectId, versionNo, previousVersionId);
    }

    @Override
    public String incrementVersion(String currentVersion) {
        if (currentVersion == null || currentVersion.isBlank()) {
            return "v1.0";
        }
        try {
            String numPart = currentVersion;
            if (currentVersion.startsWith("v") || currentVersion.startsWith("V")) {
                numPart = currentVersion.substring(1);
            }
            double val = Double.parseDouble(numPart);
            val += 0.1;
            String newNum = String.format("%.1f", val);
            return (currentVersion.startsWith("v") || currentVersion.startsWith("V")) ? "v" + newNum : newNum;
        } catch (NumberFormatException e) {
            log.warn("Could not increment version: {}, returning v1.0", currentVersion);
            return "v1.0";
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isVersionExists(String documentType, UUID documentId) {
        return versionRepository.existsByDocumentTypeAndDocumentId(documentType, documentId);
    }

    private DocumentVersionResponse toResponse(PmDocumentVersion version) {
        DocumentVersionResponse response = new DocumentVersionResponse();
        response.setId(version.getId());
        response.setDocumentType(version.getDocumentType());
        response.setDocumentId(version.getDocumentId());
        response.setDocumentCode(version.getDocumentCode());
        response.setProjectId(version.getProjectId());
        response.setVersionNo(version.getVersionNo());
        response.setChangeSummary(version.getChangeSummary());
        response.setPreviousVersionId(version.getPreviousVersionId());
        response.setApprovalStatus(version.getApprovalStatus());
        response.setApprovedBy(version.getApprovedBy());
        response.setApprovedDate(version.getApprovedDate());
        response.setSnapshotData(version.getSnapshotData());
        response.setFileRefId(version.getFileRefId());
        response.setFilePath(version.getFilePath());
        response.setIsActive(version.getIsActive());
        response.setRowVersion(version.getRowVersion());

        String createdByName = version.getCreatedBy();
        if (createdByName != null && !createdByName.isBlank()) {
            createdByName = profileRepository.findByUserId(version.getCreatedBy())
                    .map(LocalizationHelper::getFullName)
                    .orElse(version.getCreatedBy());
        }
        response.setCreatedBy(createdByName != null ? createdByName : "System");
        response.setCreatedDate(version.getCreatedDate());
        response.setUpdatedBy(version.getUpdatedBy());
        response.setUpdatedDate(version.getUpdatedDate());
        return response;
    }
}