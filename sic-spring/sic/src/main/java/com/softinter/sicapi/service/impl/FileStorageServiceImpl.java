package com.softinter.sicapi.service.impl;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
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
import software.amazon.awssdk.services.s3.model.CompleteMultipartUploadRequest;
import software.amazon.awssdk.services.s3.model.CompletedMultipartUpload;
import software.amazon.awssdk.services.s3.model.CompletedPart;
import software.amazon.awssdk.services.s3.model.CopyObjectRequest;
import software.amazon.awssdk.services.s3.model.CreateMultipartUploadRequest;
import software.amazon.awssdk.services.s3.model.CreateMultipartUploadResponse;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.S3Object;
import software.amazon.awssdk.services.s3.model.UploadPartCopyRequest;
import software.amazon.awssdk.services.s3.model.UploadPartCopyResponse;

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

            uploadRepository.save(upload);

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
    @Transactional
    public UploadSessionResponse createUploadSession(UploadSessionRequest request) {
        // 🔥 ใช้ uploadGroupId จาก request ถ้ามี ถ้าไม่มีให้สร้างใหม่
        UUID uploadGroupId = (request.getUploadGroupId() != null)
                ? request.getUploadGroupId()
                : UUID.randomUUID();

        // sessionId = uploadGroupId (ไม่ต้องสุ่มแยก)
        String sessionId = uploadGroupId.toString();

        String fileName = request.getFileName();
        long fileSize = request.getFileSize();
        String contentType = request.getContentType();

        FileCategory categoryEnum = FileCategory.values()[request.getCategory()];
        FileVisibility visibilityEnum = FileVisibilityConverter.fromCode(request.getVisibility());

        int totalChunks = (int) Math.ceil((double) fileSize / DEFAULT_CHUNK_SIZE);
        String username = currentUserService.getUsername();

        // 🔥 ตรวจสอบว่ามี session ที่ active = false และยังไม่ expired สำหรับ uploadGroupId นี้หรือไม่
        // ถ้ามีให้ใช้ตัวเดิม (ป้องกัน duplicate session)
        SuUpload existingSession = uploadRepository
                .findFirstByUploadGroupIdAndIsActiveFalseOrderByCreatedDateDesc(uploadGroupId)
                .orElse(null);

        if (existingSession != null) {
            // ถ้า session ยังไม่ expired ให้ใช้ตัวเดิม
            if (existingSession.getTempExpiresAt() == null || 
                existingSession.getTempExpiresAt().isAfter(Instant.now())) {
                log.info("♻️ Reusing existing session for uploadGroupId: {}", uploadGroupId);
                return UploadSessionResponse.builder()
                        .sessionId(uploadGroupId.toString())
                        .uploadUrl("/api/storage/upload/sessions/" + uploadGroupId + "/chunks/{chunkIndex}")
                        .chunkSize(DEFAULT_CHUNK_SIZE)
                        .totalChunks((int) Math.ceil((double) existingSession.getFileSize() / DEFAULT_CHUNK_SIZE))
                        .nextChunkIndex(countUploadedChunks(uploadGroupId))
                        .uploadGroupId(uploadGroupId)
                        .build();
            } else {
                // session หมดอายุแล้ว ให้ลบ S3 chunks และลบ record
                try {
                    deleteTempChunks("temp/sessions/" + uploadGroupId + "/");
                    uploadRepository.delete(existingSession);
                    log.info("🗑️ Deleted expired session for uploadGroupId: {}", uploadGroupId);
                } catch (Exception e) {
                    log.warn("Failed to delete expired session for uploadGroupId: {}", uploadGroupId, e);
                }
            }
        }

        // 🔥 สร้าง session ใหม่
        SuUpload sessionRecord = new SuUpload();
        sessionRecord.setUploadGroupId(uploadGroupId);
        sessionRecord.setFileName(fileName);
        sessionRecord.setFileSize(fileSize);
        sessionRecord.setContentType(contentType);
        sessionRecord.setObjectKey("temp/sessions/" + sessionId + "/");
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

        uploadRepository.save(sessionRecord);
        log.info("✅ Created upload session: sessionId={}, uploadGroupId={}", sessionId, uploadGroupId);

        return UploadSessionResponse.builder()
                .sessionId(sessionId)                           // ตรงกับ uploadGroupId
                .uploadUrl("/api/storage/upload/sessions/" + sessionId + "/chunks/{chunkIndex}")
                .chunkSize(DEFAULT_CHUNK_SIZE)
                .totalChunks(totalChunks)
                .nextChunkIndex(0)
                .uploadGroupId(uploadGroupId)
                .build();
    }

    @Override
    public UploadSessionResponse uploadChunk(UUID sessionId, int chunkIndex, MultipartFile chunk) {
        log.info("⬆️ Uploading chunk {} for session {}", chunkIndex, sessionId);

        // 🔥 sessionId คือ uploadGroupId
        // 🔥 ใช้ findFirstBy... แทน findBy... เพื่อป้องกัน unique result error
        SuUpload sessionRecord = uploadRepository
                .findFirstByUploadGroupIdAndIsActiveFalseOrderByCreatedDateDesc(sessionId)
                .or(() -> uploadRepository.findById(sessionId))
                .orElseThrow(() -> {
                    log.error("❌ Session not found for ID or uploadGroupId: {}", sessionId);
                    return new RuntimeException("Session not found for ID: " + sessionId);
                });

        // 🔥 ตรวจสอบว่า session หมดอายุหรือยัง
        if (sessionRecord.getTempExpiresAt() != null && 
            sessionRecord.getTempExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Upload session has expired. Please create a new upload.");
        }

        String chunkKey = "temp/sessions/" + sessionId + "/part-" + chunkIndex;

        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(chunkKey)
                            .contentType("application/octet-stream")
                            .build(),
                    RequestBody.fromBytes(chunk.getBytes())
            );
            log.info("✅ Uploaded chunk {} for session {}", chunkIndex, sessionId);
        } catch (IOException e) {
            log.error("Failed to upload chunk {} for session {}", chunkIndex, sessionId, e);
            throw new RuntimeException("Failed to upload chunk", e);
        } catch (S3Exception e) {
            log.error("S3 error uploading chunk {} for session {}", chunkIndex, sessionId, e);
            throw new RuntimeException("Failed to upload chunk: " + e.awsErrorDetails().errorMessage(), e);
        }

        int totalChunks = (int) Math.ceil((double) sessionRecord.getFileSize() / DEFAULT_CHUNK_SIZE);
        int nextChunkIndex = countUploadedChunks(sessionId);

        return UploadSessionResponse.builder()
                .sessionId(sessionId.toString())
                .uploadUrl("/api/storage/upload/sessions/" + sessionId + "/chunks/{chunkIndex}")
                .chunkSize(DEFAULT_CHUNK_SIZE)
                .totalChunks(totalChunks)
                .nextChunkIndex(nextChunkIndex)
                .build();
    }

    private int countUploadedChunks(UUID sessionId) {
        try {
            String prefix = "temp/sessions/" + sessionId + "/";
            ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                    .bucket(bucketName)
                    .prefix(prefix)
                    .build();
            ListObjectsV2Response listResponse = s3Client.listObjectsV2(listRequest);
            return listResponse.contents().size();
        } catch (S3Exception e) {
            log.warn("Failed to count uploaded chunks for session {}: {}", sessionId, e.awsErrorDetails().errorMessage());
            return 0;
        }
    }

    @Override
    @Transactional
    public StorageUploadResponse completeUploadSession(UUID sessionId, HttpServletRequest request) {
        // 🔥 sessionId คือ uploadGroupId
        SuUpload sessionRecord = uploadRepository
                .findFirstByUploadGroupIdAndIsActiveFalseOrderByCreatedDateDesc(sessionId)
                .or(() -> uploadRepository.findById(sessionId))
                .orElseThrow(() -> new RuntimeException("Session not found for ID: " + sessionId));

        // 🔥 ตรวจสอบว่า session หมดอายุหรือยัง
        if (sessionRecord.getTempExpiresAt() != null && 
            sessionRecord.getTempExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Upload session has expired. Please create a new upload.");
        }

        int totalChunks = (int) Math.ceil((double) sessionRecord.getFileSize() / DEFAULT_CHUNK_SIZE);
        int uploadedChunks = countUploadedChunks(sessionId);

        if (uploadedChunks < totalChunks) {
            throw new RuntimeException("Upload is incomplete. Only " + uploadedChunks + " of " + totalChunks + " chunks uploaded.");
        }

        String tempKeyPrefix = "temp/sessions/" + sessionId + "/";
        String finalKey = "uploads/" + sessionRecord.getUploadGroupId() + "/" + sessionRecord.getFileName();

        if (totalChunks == 1) {
            String chunkKey = tempKeyPrefix + "part-0";
            try {
                s3Client.copyObject(CopyObjectRequest.builder()
                        .sourceBucket(bucketName)
                        .sourceKey(chunkKey)
                        .destinationBucket(bucketName)
                        .destinationKey(finalKey)
                        .build());
                s3Client.deleteObject(DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(chunkKey)
                        .build());
            } catch (Exception e) {
                log.error("Failed to move single chunk file to final location for session {}", sessionId, e);
                throw new RuntimeException("Failed to complete upload session", e);
            }
        } else {
            try {
                CreateMultipartUploadResponse createResponse = s3Client.createMultipartUpload(
                        CreateMultipartUploadRequest.builder()
                                .bucket(bucketName)
                                .key(finalKey)
                                .contentType(sessionRecord.getContentType())
                                .build()
                );
                String uploadId = createResponse.uploadId();

                List<CompletedPart> completedParts = new ArrayList<>();

                for (int i = 0; i < totalChunks; i++) {
                    String partKey = tempKeyPrefix + "part-" + i;
                    UploadPartCopyResponse copyResponse = s3Client.uploadPartCopy(
                            UploadPartCopyRequest.builder()
                                    .destinationBucket(bucketName)
                                    .destinationKey(finalKey)
                                    .uploadId(uploadId)
                                    .partNumber(i + 1)
                                    .sourceBucket(bucketName)
                                    .sourceKey(partKey)
                                    .build()
                    );
                    completedParts.add(CompletedPart.builder()
                            .partNumber(i + 1)
                            .eTag(copyResponse.copyPartResult().eTag())
                            .build());
                }

                CompletedMultipartUpload completedMultipartUpload = CompletedMultipartUpload.builder()
                        .parts(completedParts)
                        .build();

                CompleteMultipartUploadRequest completeRequest = CompleteMultipartUploadRequest.builder()
                        .bucket(bucketName)
                        .key(finalKey)
                        .uploadId(uploadId)
                        .multipartUpload(completedMultipartUpload)
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
        response.setUploadGroupId(sessionRecord.getUploadGroupId());
        return response;
    }

    @Override
    public StorageUploadResponse completeUploadSession(UUID sessionId) {
        return completeUploadSession(sessionId, null);
    }

    @Override
    public void cancelSession(UUID sessionId) {
        // 🔥 sessionId คือ uploadGroupId
        SuUpload session;
        try {
            session = uploadRepository
                    .findFirstByUploadGroupIdAndIsActiveFalseOrderByCreatedDateDesc(sessionId)
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

    @Override
    @Transactional
    public void activateUploadGroup(UUID uploadGroupId) {
        List<SuUpload> uploads = uploadRepository.findAllByUploadGroupIdAndIsActiveFalse(uploadGroupId);
        if (uploads.isEmpty()) {
            log.debug("No inactive uploads found for group {}", uploadGroupId);
            return;
        }
        String username = currentUserService.getUsername();
        for (SuUpload upload : uploads) {
            if (upload.getTempExpiresAt() != null && upload.getTempExpiresAt().isBefore(Instant.now())) {
                log.warn("Upload {} in group {} has expired, skipping activation", upload.getId(), uploadGroupId);
                continue;
            }
            upload.setIsActive(true);
            upload.setTempExpiresAt(null);
            upload.setUpdatedBy(username);
            uploadRepository.save(upload);
            log.info("✅ Activated upload: id={}, groupId={}", upload.getId(), uploadGroupId);
        }
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