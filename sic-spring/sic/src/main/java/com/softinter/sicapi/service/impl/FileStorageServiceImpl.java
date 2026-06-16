package com.softinter.sicapi.service.impl;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.softinter.sicapi.dto.request.UploadSessionRequest;
import com.softinter.sicapi.dto.response.StorageDownloadResponse;
import com.softinter.sicapi.dto.response.StorageUploadResponse;
import com.softinter.sicapi.dto.response.UploadSessionResponse;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.enums.FileCategory;
import com.softinter.sicapi.entity.enums.FileVisibility;
import com.softinter.sicapi.entity.ex.StorageUploadReference;
import com.softinter.sicapi.entity.su.SuUpload;
import com.softinter.sicapi.repository.su.SuUploadRepository;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.FileStorageService;
import com.softinter.sicapi.util.FileVisibilityConverter;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageServiceImpl implements FileStorageService {

    private final S3Client s3Client;
    private final SuUploadRepository uploadRepository;
    private final CurrentUserService currentUserService;

    @Value("${app.storage.s3.bucket}")
    private String bucketName;

    private static final int DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024;
    private static final long TEMP_UPLOAD_EXPIRY_SECONDS = 24 * 60 * 60;

    // ==================== Single file ====================
    @Override
    public StorageUploadResponse uploadFile(MultipartFile file, String category, String visibility, UUID uploadGroupId) {
        try {
            String fileName = file.getOriginalFilename();
            String key = "uploads/" + UUID.randomUUID() + "/" + fileName;

            try {
                s3Client.putObject(PutObjectRequest.builder()
                                .bucket(bucketName)
                                .key(key)
                                .contentType(file.getContentType())
                                .build(),
                        RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            } catch (S3Exception e) {
                log.error("S3 upload failed for file {}", fileName, e);
                throw new RuntimeException("Failed to upload file to S3: " + e.awsErrorDetails().errorMessage(), e);
            }

            FileCategory categoryEnum = FileCategory.valueOf(category.toUpperCase());
            FileVisibility visibilityEnum = FileVisibility.valueOf(visibility.toUpperCase());
            String username = currentUserService.getUsername();

            SuUpload upload = new SuUpload();
            upload.setFileName(fileName);
            upload.setObjectKey(key);
            upload.setBucketName(bucketName);
            upload.setFileSize(file.getSize());
            upload.setContentType(file.getContentType());
            upload.setCategory(categoryEnum);
            upload.setVisibility(visibilityEnum);
            upload.setUploadGroupId(uploadGroupId);
            upload.setIsActive(false);
            upload.setTempExpiresAt(Instant.now().plusSeconds(TEMP_UPLOAD_EXPIRY_SECONDS));
            upload.setIsStreaming(false);
            upload.setCreatedBy(username);
            upload.setUpdatedBy(username);

            String storageUrl = s3Client.utilities().getUrl(b -> b.bucket(bucketName).key(key)).toExternalForm();
            String accessUrl = "/api/storage/files/" + bucketName + "/" + key;
            upload.setStorageUrl(storageUrl);
            upload.setAccessUrl(accessUrl);

            try {
                uploadRepository.save(upload);
            } catch (Exception e) {
                log.error("Failed to save upload record for file {}", fileName, e);
                throw new RuntimeException("Failed to save upload metadata", e);
            }

            StorageUploadResponse response = new StorageUploadResponse();
            response.setId(upload.getId());
            response.setFileName(fileName);
            response.setFileUrl(storageUrl);
            response.setFileSize(file.getSize());
            response.setContentType(file.getContentType());
            response.setUploadGroupId(uploadGroupId);
            return response;
        } catch (IOException e) {
            log.error("IO error reading file", e);
            throw new RuntimeException("Failed to read file content", e);
        }
    }

    // ==================== Resumable upload session ====================
    @Override
    public UploadSessionResponse createUploadSession(UploadSessionRequest request) {
        try {
            UUID sessionId = UUID.randomUUID();
            String fileName = request.getFileName();
            long fileSize = request.getFileSize();
            String contentType = request.getContentType();

            FileCategory categoryEnum = FileCategory.values()[request.getCategory()];
            FileVisibility visibilityEnum = FileVisibilityConverter.fromCode(request.getVisibility());

            int totalChunks = (int) Math.ceil((double) fileSize / DEFAULT_CHUNK_SIZE);
            String tempKeyPrefix = "temp/sessions/" + sessionId + "/";
            String username = currentUserService.getUsername();

            SuUpload sessionRecord = new SuUpload();
            sessionRecord.setUploadGroupId(sessionId);
            sessionRecord.setFileName(fileName);
            sessionRecord.setFileSize(fileSize);
            sessionRecord.setContentType(contentType);
            sessionRecord.setObjectKey(tempKeyPrefix);
            sessionRecord.setBucketName(bucketName);
            sessionRecord.setCategory(categoryEnum);
            sessionRecord.setVisibility(visibilityEnum);
            sessionRecord.setIsActive(false);
            sessionRecord.setIsStreaming(false);
            sessionRecord.setTempExpiresAt(Instant.now().plusSeconds(TEMP_UPLOAD_EXPIRY_SECONDS));
            sessionRecord.setStorageUrl("");
            sessionRecord.setAccessUrl("");
            sessionRecord.setCreatedBy(username);
            sessionRecord.setUpdatedBy(username);

            try {
                uploadRepository.save(sessionRecord);
            } catch (Exception e) {
                log.error("Failed to create upload session for file {}", fileName, e);
                throw new RuntimeException("Failed to create upload session", e);
            }

            return UploadSessionResponse.builder()
                    .sessionId(sessionId.toString())
                    .uploadUrl("/api/storage/upload/sessions/" + sessionId + "/chunks/{chunkIndex}")
                    .chunkSize(DEFAULT_CHUNK_SIZE)
                    .totalChunks(totalChunks)
                    .nextChunkIndex(0)
                    .uploadedBytes(0L)
                    .build();
        } catch (Exception e) {
            log.error("Unexpected error creating upload session", e);
            throw new RuntimeException("Failed to create upload session", e);
        }
    }

    @Override
    public UploadSessionResponse uploadChunk(UUID sessionId, int chunkIndex, MultipartFile chunk) {
        String chunkKey = String.format("temp/sessions/%s/chunk_%d", sessionId, chunkIndex);
        log.info("Uploading chunk {} for session {} to S3 key: {}", chunkIndex, sessionId, chunkKey);

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(chunkKey)
                    .contentType(chunk.getContentType())
                    .build();
            s3Client.putObject(putRequest,
                    RequestBody.fromInputStream(chunk.getInputStream(), chunk.getSize()));
            log.info("Chunk {} uploaded successfully", chunkIndex);
        } catch (IOException e) {
            log.error("IO error reading chunk data", e);
            throw new RuntimeException("Failed to read chunk data", e);
        } catch (S3Exception e) {
            log.error("S3 upload failed for chunk {}", chunkIndex, e);
            throw new RuntimeException("Failed to upload chunk to S3: " + e.awsErrorDetails().errorMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error uploading chunk", e);
            throw new RuntimeException("Failed to upload chunk", e);
        }

        SuUpload session;
        try {
            session = uploadRepository.findByUploadGroupIdAndIsActiveFalse(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
        } catch (Exception e) {
            log.error("Failed to find upload session {}", sessionId, e);
            throw new RuntimeException("Upload session not found or database error", e);
        }

        long fileSize = session.getFileSize();
        int chunkSize = DEFAULT_CHUNK_SIZE;
        int totalChunks = (int) Math.ceil((double) fileSize / chunkSize);
        long uploadedBytes = Math.min((chunkIndex + 1) * (long) chunkSize, fileSize);
        int nextChunkIndex = chunkIndex + 1;

        return UploadSessionResponse.builder()
                .sessionId(sessionId.toString())
                .uploadUrl("/api/storage/upload/sessions/" + sessionId + "/chunks/{chunkIndex}")
                .chunkSize(chunkSize)
                .totalChunks(totalChunks)
                .nextChunkIndex(nextChunkIndex)
                .uploadedBytes(uploadedBytes)
                .build();
    }

    @Override
    @Transactional
    public StorageUploadResponse completeUploadSession(UUID sessionId, HttpServletRequest request) {
        SuUpload sessionRecord;
        try {
            sessionRecord = uploadRepository.findByUploadGroupIdAndIsActiveFalse(sessionId)
                    .orElseThrow(() -> new RuntimeException("Upload session not found or already completed"));
        } catch (Exception e) {
            log.error("Failed to find upload session {}", sessionId, e);
            throw new RuntimeException("Upload session not found", e);
        }

        if (sessionRecord.getTempExpiresAt() != null && sessionRecord.getTempExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Upload session has expired");
        }

        String tempKeyPrefix = sessionRecord.getObjectKey();
        String finalKey = "uploads/" + sessionRecord.getUploadGroupId() + "/" + sessionRecord.getFileName();

        long fileSize = sessionRecord.getFileSize();
        int chunkSize = DEFAULT_CHUNK_SIZE;
        int totalChunks = (int) Math.ceil((double) fileSize / chunkSize);

        if (totalChunks == 1) {
            String sourceKey = tempKeyPrefix + "chunk_0";
            try {
                s3Client.headObject(HeadObjectRequest.builder().bucket(bucketName).key(sourceKey).build());
                s3Client.copyObject(CopyObjectRequest.builder()
                        .copySource(bucketName + "/" + sourceKey)
                        .destinationBucket(bucketName)
                        .destinationKey(finalKey)
                        .build());
                s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucketName).key(sourceKey).build());
            } catch (S3Exception e) {
                log.error("Source chunk missing: {}", sourceKey, e);
                throw new RuntimeException("Upload incomplete: missing chunk", e);
            } catch (Exception e) {
                log.error("Unexpected error completing single‑chunk upload", e);
                throw new RuntimeException("Failed to complete upload session", e);
            }
        } else {
            try {
                CreateMultipartUploadRequest createRequest = CreateMultipartUploadRequest.builder()
                        .bucket(bucketName)
                        .key(finalKey)
                        .contentType(sessionRecord.getContentType())
                        .build();
                CreateMultipartUploadResponse createResponse = s3Client.createMultipartUpload(createRequest);
                String uploadId = createResponse.uploadId();

                List<CompletedPart> completedParts = new java.util.ArrayList<>();

                for (int i = 0; i < totalChunks; i++) {
                    String chunkKey = tempKeyPrefix + "chunk_" + i;
                    try {
                        s3Client.headObject(HeadObjectRequest.builder().bucket(bucketName).key(chunkKey).build());
                    } catch (S3Exception e) {
                        throw new RuntimeException("Missing chunk " + i + " for session " + sessionId, e);
                    }

                    UploadPartCopyRequest copyRequest = UploadPartCopyRequest.builder()
                            .copySource(bucketName + "/" + chunkKey)
                            .destinationBucket(bucketName)
                            .destinationKey(finalKey)
                            .uploadId(uploadId)
                            .partNumber(i + 1)
                            .build();

                    UploadPartCopyResponse copyResponse = s3Client.uploadPartCopy(copyRequest);
                    completedParts.add(CompletedPart.builder()
                            .partNumber(i + 1)
                            .eTag(copyResponse.copyPartResult().eTag())
                            .build());
                }

                CompleteMultipartUploadRequest completeRequest = CompleteMultipartUploadRequest.builder()
                        .bucket(bucketName)
                        .key(finalKey)
                        .uploadId(uploadId)
                        .multipartUpload(CompletedMultipartUpload.builder().parts(completedParts).build())
                        .build();
                s3Client.completeMultipartUpload(completeRequest);

                deleteTempChunks(tempKeyPrefix);

            } catch (S3Exception e) {
                log.error("Multipart upload failed for session {}", sessionId, e);
                throw new RuntimeException("Failed to complete upload session: " + e.awsErrorDetails().errorMessage(), e);
            } catch (Exception e) {
                log.error("Unexpected error during multipart upload completion", e);
                throw new RuntimeException("Failed to complete upload session", e);
            }
        }

        try {
            sessionRecord.setObjectKey(finalKey);
            sessionRecord.setIsActive(true);
            sessionRecord.setTempExpiresAt(null);
            sessionRecord.setUpdatedBy(currentUserService.getUsername());

            String storageUrl = s3Client.utilities().getUrl(b -> b.bucket(bucketName).key(finalKey)).toExternalForm();
            String accessUrl;
            if (request != null) {
                String scheme = request.getScheme();
                String serverName = request.getServerName();
                int serverPort = request.getServerPort();
                String contextPath = request.getContextPath();
                String baseUrl = scheme + "://" + serverName + ":" + serverPort + contextPath;
                accessUrl = baseUrl + "/api/storage/files/" + bucketName + "/" + finalKey;
            } else {
                accessUrl = "/api/storage/files/" + bucketName + "/" + finalKey;
            }
            sessionRecord.setStorageUrl(storageUrl);
            sessionRecord.setAccessUrl(accessUrl);
            uploadRepository.save(sessionRecord);
        } catch (Exception e) {
            log.error("Failed to update database record for session {}", sessionId, e);
            throw new RuntimeException("Failed to save upload metadata", e);
        }

        StorageUploadResponse response = new StorageUploadResponse();
        response.setId(sessionRecord.getId());
        response.setFileName(sessionRecord.getFileName());
        response.setFileUrl(sessionRecord.getStorageUrl());
        response.setFileSize(sessionRecord.getFileSize());
        response.setContentType(sessionRecord.getContentType());
        response.setUploadGroupId(sessionId);
        return response;
    }

    @Override
    @Transactional
    public StorageUploadResponse completeUploadSession(UUID sessionId) {
        return completeUploadSession(sessionId, null);
    }

    @Override
    public void cancelSession(UUID sessionId) {
        SuUpload session;
        try {
            session = uploadRepository.findByUploadGroupIdAndIsActiveFalse(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
        } catch (Exception e) {
            log.error("Session not found for cancellation: {}", sessionId, e);
            throw new RuntimeException("Session not found", e);
        }
        String prefix = session.getObjectKey();
        deleteTempChunks(prefix);
        try {
            uploadRepository.delete(session);
        } catch (Exception e) {
            log.error("Failed to delete session record for {}", sessionId, e);
            throw new RuntimeException("Failed to cancel session", e);
        }
    }

    private void deleteTempChunks(String prefix) {
        try {
            ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                    .bucket(bucketName)
                    .prefix(prefix)
                    .build();
            ListObjectsV2Response listResponse = s3Client.listObjectsV2(listRequest);
            for (S3Object s3Obj : listResponse.contents()) {
                try {
                    s3Client.deleteObject(DeleteObjectRequest.builder()
                            .bucket(bucketName)
                            .key(s3Obj.key())
                            .build());
                } catch (S3Exception e) {
                    log.warn("Failed to delete temp object {}: {}", s3Obj.key(), e.awsErrorDetails().errorMessage());
                }
            }
        } catch (S3Exception e) {
            log.warn("Failed to list temp chunks with prefix {}: {}", prefix, e.awsErrorDetails().errorMessage());
        } catch (Exception e) {
            log.warn("Unexpected error while deleting temp chunks with prefix {}", prefix, e);
        }
    }

    // ==================== Activate Upload ====================
    @Override
    @Transactional
    public void activateUpload(UUID uploadId, String userId) {
        SuUpload upload;
        try {
            upload = uploadRepository.findById(uploadId)
                    .orElseThrow(() -> new RuntimeException("Upload not found: " + uploadId));
        } catch (Exception e) {
            log.error("Failed to find upload for activation: {}", uploadId, e);
            throw new RuntimeException("Upload not found", e);
        }

        if (upload.getIsActive()) {
            log.debug("Upload {} is already active", uploadId);
            return;
        }

        if (upload.getTempExpiresAt() != null && upload.getTempExpiresAt().isBefore(Instant.now())) {
            throw new IllegalStateException("Upload has expired and cannot be activated");
        }

        String currentUsername = currentUserService.getUsername();
        if (!currentUsername.equals(upload.getCreatedBy())) {
            throw new SecurityException("Only the uploader can activate this upload");
        }

        try {
            upload.setIsActive(true);
            upload.setTempExpiresAt(null);
            upload.setUpdatedBy(currentUsername);
            uploadRepository.save(upload);
            log.info("Activated upload: id={}, groupId={}", uploadId, upload.getUploadGroupId());
        } catch (Exception e) {
            log.error("Failed to save activated upload {}", uploadId, e);
            throw new RuntimeException("Failed to activate upload", e);
        }
    }

    @Override
    public void activateUpload(UUID uploadId) {
        activateUpload(uploadId, null);
    }

    // ==================== Cleanup Expired Temporary Uploads ====================
    @Override
@Transactional
public void cleanupExpiredTemporaryUploads() {
    Instant now = Instant.now();
    List<SuUpload> expired;
    try {
        expired = uploadRepository.findAllByIsActiveFalseAndTempExpiresAtBefore(now);
    } catch (Exception e) {
        log.error("Failed to query expired temporary uploads", e);
        return;
    }

    if (expired.isEmpty()) {
        log.debug("No expired temporary uploads to clean up");
        return;
    }

    log.info("Found {} expired temporary uploads to clean up", expired.size());
    for (SuUpload upload : expired) {
        try {
            deletePhysicalFile(upload.getBucketName(), upload.getObjectKey());
            int updated = uploadRepository.softDeleteExpiredUpload(
                upload.getId(), "system-cleanup", Instant.now(), now);
            if (updated == 0) {
                log.warn("Could not soft delete expired upload id={} (maybe already deleted)", upload.getId());
            } else {
                log.info("Deleted expired temporary upload: id={}, groupId={}", upload.getId(), upload.getUploadGroupId());
            }
        } catch (Exception e) {
            log.error("Failed to delete expired upload: id={}", upload.getId(), e);
        }
    }
}

    private void deletePhysicalFile(String bucketName, String objectKey) {
        try {
            if (objectKey.endsWith("/")) {
                ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                        .bucket(bucketName)
                        .prefix(objectKey)
                        .build();
                ListObjectsV2Response listResponse = s3Client.listObjectsV2(listRequest);
                for (S3Object s3Obj : listResponse.contents()) {
                    try {
                        s3Client.deleteObject(DeleteObjectRequest.builder()
                                .bucket(bucketName)
                                .key(s3Obj.key())
                                .build());
                    } catch (S3Exception e) {
                        if (e.statusCode() != 404) {
                            log.warn("Failed to delete file {}: {}", s3Obj.key(), e.awsErrorDetails().errorMessage());
                        }
                    }
                }
            } else {
                s3Client.deleteObject(DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(objectKey)
                        .build());
            }
        } catch (S3Exception e) {
            if (e.statusCode() != 404) {
                log.warn("Failed to delete physical file: {}/{} - {}", bucketName, objectKey, e.awsErrorDetails().errorMessage());
            }
        } catch (Exception e) {
            log.warn("Unexpected error while deleting physical file: {}/{}", bucketName, objectKey, e);
        }
    }

    @Override
    public String getFileUrlByUploadGroupId(UUID uploadGroupId) {
        if (uploadGroupId == null) return null;
        try {
            return uploadRepository
                    .findFirstByUploadGroupIdAndIsActiveTrueOrderByCreatedDateDesc(uploadGroupId)
                    .map(upload -> {
                        String url = upload.getStorageUrl();
                        return (url != null && !url.isBlank()) ? url : upload.getAccessUrl();
                    })
                    .orElse(null);
        } catch (Exception e) {
            log.error("Failed to get file URL for group {}", uploadGroupId, e);
            return null;
        }
    }

    // ==================== Sync uploads methods ====================
    @Override
    public UUID resolveUploadGroupId(UUID currentUploadGroupId, List<StorageUploadReference> uploadReferences) {
        if (uploadReferences == null || uploadReferences.isEmpty()) {
            return null;
        }
        boolean hasActiveUploads = uploadReferences.stream()
                .anyMatch(ref -> ref.getState() != EntityState.DELETED.getEntityStateCode());
        if (!hasActiveUploads) {
            return null;
        }
        if (currentUploadGroupId == null || currentUploadGroupId.equals(new UUID(0, 0))) {
            return UUID.randomUUID();
        }
        return currentUploadGroupId;
    }

    @Override
    @Transactional
    public void syncUploads(UUID uploadGroupId, List<StorageUploadReference> uploadReferences) {
        if (uploadReferences == null || uploadReferences.isEmpty()) {
            return;
        }

        List<UUID> deletedIds = uploadReferences.stream()
                .filter(ref -> ref.getState() == EntityState.DELETED.getEntityStateCode())
                .map(StorageUploadReference::getId)
                .collect(Collectors.toList());
        for (UUID id : deletedIds) {
            try {
                deleteUpload(id);
            } catch (Exception e) {
                log.error("Failed to delete upload {} during sync", id, e);
            }
        }

        List<UUID> activeIds = uploadReferences.stream()
                .filter(ref -> ref.getState() != EntityState.DELETED.getEntityStateCode())
                .map(StorageUploadReference::getId)
                .collect(Collectors.toList());
        if (activeIds.isEmpty()) {
            return;
        }

        List<SuUpload> uploads;
        try {
            uploads = uploadRepository.findAllById(activeIds);
        } catch (Exception e) {
            log.error("Failed to find uploads by IDs", e);
            throw new RuntimeException("Failed to sync uploads", e);
        }

        Map<UUID, StorageUploadReference> refMap = uploadReferences.stream()
                .filter(ref -> ref.getState() != EntityState.DELETED.getEntityStateCode())
                .collect(Collectors.toMap(StorageUploadReference::getId, ref -> ref));

        for (SuUpload upload : uploads) {
            StorageUploadReference ref = refMap.get(upload.getId());
            if (ref == null) {
                continue;
            }
            try {
                upload.setUploadGroupId(uploadGroupId);
                if (ref.getIsActive() != null) {
                    upload.setIsActive(ref.getIsActive());
                    if (Boolean.TRUE.equals(ref.getIsActive())) {
                        upload.setTempExpiresAt(null);
                    }
                }
                uploadRepository.save(upload);
            } catch (Exception e) {
                log.error("Failed to update upload {} during sync", upload.getId(), e);
            }
        }
    }

    private void deleteUpload(UUID uploadId) {
        SuUpload upload;
        try {
            upload = uploadRepository.findById(uploadId).orElse(null);
        } catch (Exception e) {
            log.error("Failed to find upload {} for deletion", uploadId, e);
            return;
        }
        if (upload == null) return;
        deletePhysicalFile(upload.getBucketName(), upload.getObjectKey());
        try {
            uploadRepository.delete(upload);
        } catch (Exception e) {
            log.error("Failed to delete upload record {}", uploadId, e);
        }
    }

    // ==================== Other existing methods ====================
    @Override
    public StorageDownloadResponse downloadFile(UUID fileId) {
        SuUpload upload;
        try {
            upload = uploadRepository.findByIdAndIsActiveTrue(fileId)
                    .orElseThrow(() -> new RuntimeException("File not found"));
        } catch (Exception e) {
            log.error("Failed to find file {}", fileId, e);
            throw new RuntimeException("File not found", e);
        }
        try {
            var s3Object = s3Client.getObject(GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(upload.getObjectKey())
                    .build());
            StorageDownloadResponse response = new StorageDownloadResponse();
            response.setInputStream(s3Object);
            response.setFileName(upload.getFileName());
            response.setContentType(upload.getContentType());
            response.setFileSize(upload.getFileSize());
            return response;
        } catch (S3Exception e) {
            log.error("S3 download failed for file {}", fileId, e);
            throw new RuntimeException("Failed to download file from S3: " + e.awsErrorDetails().errorMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error downloading file {}", fileId, e);
            throw new RuntimeException("Failed to download file", e);
        }
    }

    @Override
    public void deleteFile(UUID fileId) {
        SuUpload upload;
        try {
            upload = uploadRepository.findByIdAndIsActiveTrue(fileId)
                    .orElseThrow(() -> new RuntimeException("File not found"));
        } catch (Exception e) {
            log.error("Failed to find file {} for deletion", fileId, e);
            throw new RuntimeException("File not found", e);
        }
        deletePhysicalFile(upload.getBucketName(), upload.getObjectKey());
        try {
            upload.setIsActive(false);
            uploadRepository.save(upload);
        } catch (Exception e) {
            log.error("Failed to update file record after deletion {}", fileId, e);
            throw new RuntimeException("Failed to delete file", e);
        }
    }

    @Override
    public String getFileUrl(UUID fileId) {
        SuUpload upload;
        try {
            upload = uploadRepository.findByIdAndIsActiveTrue(fileId)
                    .orElseThrow(() -> new RuntimeException("File not found"));
        } catch (Exception e) {
            log.error("Failed to find file {} for URL", fileId, e);
            throw new RuntimeException("File not found", e);
        }
        try {
            return s3Client.utilities().getUrl(b -> b.bucket(bucketName).key(upload.getObjectKey())).toExternalForm();
        } catch (S3Exception e) {
            log.error("Failed to generate URL for file {}", fileId, e);
            throw new RuntimeException("Failed to generate file URL", e);
        }
    }

    @Override
    public StorageDownloadResponse downloadByKey(String bucketName, String objectKey) {
        if (!this.bucketName.equals(bucketName)) {
            throw new RuntimeException("Bucket not accessible");
        }
        SuUpload upload;
        try {
            upload = uploadRepository.findByObjectKey(objectKey)
                    .orElseThrow(() -> new RuntimeException("File not found"));
        } catch (Exception e) {
            log.error("Failed to find file by key {}", objectKey, e);
            throw new RuntimeException("File not found", e);
        }
        try {
            var s3Object = s3Client.getObject(GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build());
            StorageDownloadResponse response = new StorageDownloadResponse();
            response.setInputStream(s3Object);
            response.setFileName(upload.getFileName());
            response.setContentType(upload.getContentType());
            response.setFileSize(upload.getFileSize());
            return response;
        } catch (S3Exception e) {
            log.error("S3 download failed for key {}", objectKey, e);
            throw new RuntimeException("Failed to download file from S3: " + e.awsErrorDetails().errorMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error downloading file by key {}", objectKey, e);
            throw new RuntimeException("Failed to download file", e);
        }
    }
}