package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.UploadSessionRequest;
import com.softinter.sicapi.dto.response.StorageDownloadResponse;
import com.softinter.sicapi.dto.response.StorageUploadResponse;
import com.softinter.sicapi.dto.response.UploadSessionResponse;
import com.softinter.sicapi.entity.enums.FileCategory;
import com.softinter.sicapi.entity.enums.FileVisibility;
import com.softinter.sicapi.entity.su.SuUpload;
import com.softinter.sicapi.repository.su.SuUploadRepository;
import com.softinter.sicapi.service.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageServiceImpl implements FileStorageService {

    private final S3Client s3Client;
    private final SuUploadRepository uploadRepository;

    @Value("${app.storage.s3.bucket}")
    private String bucketName;

    private static final int DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

    // ==================== Single file ====================
    @Override
    public StorageUploadResponse uploadFile(MultipartFile file, String category, String visibility, UUID uploadGroupId) {
        try {
            String fileName = file.getOriginalFilename();
            String key = "uploads/" + UUID.randomUUID() + "/" + fileName;

            s3Client.putObject(PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            FileCategory categoryEnum = FileCategory.valueOf(category.toUpperCase());
            FileVisibility visibilityEnum = FileVisibility.valueOf(visibility.toUpperCase());

            SuUpload upload = new SuUpload();
            upload.setFileName(fileName);
            upload.setObjectKey(key);
            upload.setBucketName(bucketName);
            upload.setFileSize(file.getSize());
            upload.setContentType(file.getContentType());
            upload.setMimeType(file.getContentType());
            upload.setFileCategory(categoryEnum);
            upload.setCategory(categoryEnum.name());
            upload.setFileVisibility(visibilityEnum);
            upload.setVisibility(visibilityEnum);
            upload.setUploadGroupId(uploadGroupId);
            upload.setIsActive(true);
            upload.setIsStreaming(false);

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
            response.setMimeType(file.getContentType());
            response.setUploadGroupId(uploadGroupId);
            return response;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    @Override
    public StorageDownloadResponse downloadFile(UUID fileId) {
        SuUpload upload = uploadRepository.findByIdAndIsActiveTrue(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
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
        } catch (Exception e) {
            throw new RuntimeException("Failed to download file", e);
        }
    }

    @Override
    public void deleteFile(UUID fileId) {
        SuUpload upload = uploadRepository.findByIdAndIsActiveTrue(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(upload.getObjectKey())
                .build());
        upload.setIsActive(false);
        uploadRepository.save(upload);
    }

    @Override
    public String getFileUrl(UUID fileId) {
        SuUpload upload = uploadRepository.findByIdAndIsActiveTrue(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        return s3Client.utilities().getUrl(b -> b.bucket(bucketName).key(upload.getObjectKey())).toExternalForm();
    }

    // ==================== Resumable upload session ====================
    @Override
    public UploadSessionResponse createUploadSession(UploadSessionRequest request) {
        UUID sessionId = UUID.randomUUID();
        String fileName = request.getFileName();
        long fileSize = request.getFileSize();
        String mimeType = request.getContentType();

        FileCategory categoryEnum = FileCategory.values()[request.getCategory()];
        FileVisibility visibilityEnum = FileVisibility.fromCode(request.getVisibility());

        int totalChunks = (int) Math.ceil((double) fileSize / DEFAULT_CHUNK_SIZE);
        String tempKeyPrefix = "temp/sessions/" + sessionId + "/";

        SuUpload sessionRecord = new SuUpload();
        sessionRecord.setUploadGroupId(sessionId);
        sessionRecord.setFileName(fileName);
        sessionRecord.setFileSize(fileSize);
        sessionRecord.setMimeType(mimeType);
        sessionRecord.setContentType(mimeType);
        sessionRecord.setObjectKey(tempKeyPrefix);
        sessionRecord.setBucketName(bucketName);
        sessionRecord.setFileCategory(categoryEnum);
        sessionRecord.setCategory(categoryEnum.name());
        sessionRecord.setFileVisibility(visibilityEnum);
        sessionRecord.setVisibility(visibilityEnum);
        sessionRecord.setIsActive(false);
        sessionRecord.setIsStreaming(false);
        sessionRecord.setTempExpiresAt(Instant.now().plusSeconds(86400));
        sessionRecord.setStorageUrl("");
        sessionRecord.setAccessUrl("");

        uploadRepository.save(sessionRecord);

        return UploadSessionResponse.builder()
                .sessionId(sessionId.toString())
                .uploadUrl("/api/storage/upload/sessions/" + sessionId + "/chunks/{chunkIndex}")
                .chunkSize(DEFAULT_CHUNK_SIZE)
                .totalChunks(totalChunks)
                .nextChunkIndex(0)
                .uploadedBytes(0L)
                .build();
    }

    @Override
    public UploadSessionResponse uploadChunk(UUID sessionId, int chunkIndex, MultipartFile chunk) {
        String chunkKey = String.format("temp/sessions/%s/chunk_%d", sessionId, chunkIndex);
        log.info(">>> Uploading chunk {} for session {} to S3 key: {}", chunkIndex, sessionId, chunkKey);
        
        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(chunkKey)
                    .contentType(chunk.getContentType())
                    .build();
            s3Client.putObject(putRequest,
                    RequestBody.fromInputStream(chunk.getInputStream(), chunk.getSize()));
            log.info(">>> Chunk {} uploaded successfully to {}", chunkIndex, chunkKey);
        } catch (Exception e) {
            log.error("Failed to upload chunk", e);
            throw new RuntimeException("Failed to upload chunk", e);
        }
        
        SuUpload session = uploadRepository.findByUploadGroupIdAndIsActiveFalse(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
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
    public StorageUploadResponse completeUploadSession(UUID sessionId) {
        SuUpload sessionRecord = uploadRepository.findByUploadGroupIdAndIsActiveFalse(sessionId)
                .orElseThrow(() -> new RuntimeException("Upload session not found or already completed"));

        if (sessionRecord.getTempExpiresAt() != null && sessionRecord.getTempExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Upload session has expired");
        }

        String tempKeyPrefix = sessionRecord.getObjectKey();
        String sourceKey = tempKeyPrefix + "chunk_0";
        String finalKey = "uploads/" + sessionRecord.getUploadGroupId() + "/" + sessionRecord.getFileName();

        try {
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(sourceKey)
                    .build();
            s3Client.headObject(headRequest);
        } catch (S3Exception e) {
            log.error("Source chunk does not exist: {}", sourceKey);
            throw new RuntimeException("Upload incomplete: missing chunk", e);
        }

        try {
            CopyObjectRequest copyRequest = CopyObjectRequest.builder()
                    .copySource(bucketName + "/" + sourceKey)
                    .destinationBucket(bucketName)
                    .destinationKey(finalKey)
                    .build();
            s3Client.copyObject(copyRequest);
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(sourceKey)
                    .build());
        } catch (Exception e) {
            log.error("Failed to finalize file from {} to {}", sourceKey, finalKey, e);
            throw new RuntimeException("Failed to complete upload session", e);
        }

        sessionRecord.setObjectKey(finalKey);
        sessionRecord.setIsActive(true);
        sessionRecord.setTempExpiresAt(null);
        String storageUrl = s3Client.utilities().getUrl(b -> b.bucket(bucketName).key(finalKey)).toExternalForm();
        sessionRecord.setStorageUrl(storageUrl);
        sessionRecord.setAccessUrl("/api/storage/files/" + bucketName + "/" + finalKey);
        uploadRepository.save(sessionRecord);

        StorageUploadResponse response = new StorageUploadResponse();
        response.setId(sessionRecord.getId());
        response.setFileName(sessionRecord.getFileName());
        response.setFileUrl(storageUrl);
        response.setFileSize(sessionRecord.getFileSize());
        response.setMimeType(sessionRecord.getContentType());
        response.setUploadGroupId(sessionId);
        return response;
    }

    @Override
    public StorageUploadResponse completeUploadSession(UUID sessionId, HttpServletRequest request) {
        return completeUploadSession(sessionId);
    }

    @Override
    public void cancelSession(UUID sessionId) {
        SuUpload session = uploadRepository.findByUploadGroupIdAndIsActiveFalse(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        String prefix = session.getObjectKey();
        try {
            ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                    .bucket(bucketName)
                    .prefix(prefix)
                    .build();
            ListObjectsV2Response listResponse = s3Client.listObjectsV2(listRequest);
            for (S3Object s3Obj : listResponse.contents()) {
                s3Client.deleteObject(DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(s3Obj.key())
                        .build());
            }
        } catch (Exception e) {
            log.warn("Failed to delete temp objects for session {}", sessionId, e);
        }
        uploadRepository.delete(session);
    }

    @Override
    public void activateUpload(UUID uploadId) {
        SuUpload upload = uploadRepository.findById(uploadId)
                .orElseThrow(() -> new RuntimeException("Upload not found"));
        upload.setIsActive(true);
        uploadRepository.save(upload);
    }

    @Override
    public StorageDownloadResponse downloadByKey(String bucketName, String objectKey) {
        if (!this.bucketName.equals(bucketName)) {
            throw new RuntimeException("Bucket not accessible");
        }
        SuUpload upload = uploadRepository.findByObjectKey(objectKey)
                .orElseThrow(() -> new RuntimeException("File not found"));
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
    }
}