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
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageServiceImpl implements FileStorageService {

    private final S3Client s3Client;
    private final SuUploadRepository uploadRepository;

    @Value("${app.storage.s3.bucket}")
    private String bucketName;

    private static final int DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

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

            // แปลง category และ visibility จาก String -> Enum
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
            
            // สร้าง URLs
            String storageUrl = s3Client.utilities().getUrl(builder -> builder.bucket(bucketName).key(key)).toExternalForm();
            String accessUrl = "/api/storage/files/" + bucketName + "/" + key; // หรือรูปแบบตามที่ใช้
            upload.setStorageUrl(storageUrl);
            upload.setAccessUrl(accessUrl);
            
            uploadRepository.save(upload);

            StorageUploadResponse response = new StorageUploadResponse();
            response.setId(upload.getId());
            response.setFileName(fileName);
            response.setFileUrl(getFileUrl(upload.getId()));
            response.setFileSize(file.getSize());
            response.setMimeType(file.getContentType());
            response.setUploadGroupId(uploadGroupId);
            return response;

        } catch (IOException e) {
            log.error("Failed to upload file", e);
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
            log.error("Failed to download file: {}", fileId, e);
            throw new RuntimeException("Failed to download file", e);
        }
    }

    @Override
    public void deleteFile(UUID fileId) {
        SuUpload upload = uploadRepository.findByIdAndIsActiveTrue(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(upload.getObjectKey())
                    .build());

            upload.setIsActive(false);
            uploadRepository.save(upload);
        } catch (Exception e) {
            log.error("Failed to delete file: {}", fileId, e);
            throw new RuntimeException("Failed to delete file", e);
        }
    }

    @Override
    public String getFileUrl(UUID fileId) {
        SuUpload upload = uploadRepository.findByIdAndIsActiveTrue(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        return s3Client.utilities().getUrl(builder ->
                builder.bucket(bucketName).key(upload.getObjectKey())).toExternalForm();
    }

    @Override
    public UploadSessionResponse createUploadSession(UploadSessionRequest request) {
        UUID sessionId = UUID.randomUUID();
        String fileName = request.getFileName();
        long fileSize = request.getFileSize();
        String mimeType = request.getContentType();

        // แปลงค่า
        FileCategory categoryEnum = FileCategory.values()[request.getCategory()];
        FileVisibility visibilityEnum = FileVisibility.fromCode(request.getVisibility());

        int totalChunks = (int) Math.ceil((double) fileSize / DEFAULT_CHUNK_SIZE);
        String tempKey = "temp/sessions/" + sessionId + "/" + fileName;

        SuUpload sessionRecord = new SuUpload();

        // ข้อมูลพื้นฐาน
        sessionRecord.setUploadGroupId(sessionId);
        sessionRecord.setFileName(fileName);
        sessionRecord.setFileSize(fileSize);
        sessionRecord.setMimeType(mimeType);
        sessionRecord.setContentType(mimeType);
        sessionRecord.setObjectKey(tempKey);
        sessionRecord.setBucketName(bucketName);

        // Category & Visibility
        sessionRecord.setFileCategory(categoryEnum);
        sessionRecord.setCategory(categoryEnum.name());
        sessionRecord.setFileVisibility(visibilityEnum);
        sessionRecord.setVisibility(visibilityEnum);

        // สถานะ
        sessionRecord.setIsActive(false);
        sessionRecord.setIsStreaming(false);
        sessionRecord.setTempExpiresAt(Instant.now().plusSeconds(86400)); // 24 ชม.

        // URLs (ใส่ว่างไว้ก่อน)
        sessionRecord.setStorageUrl("");
        sessionRecord.setAccessUrl("");

        uploadRepository.save(sessionRecord);

        return UploadSessionResponse.builder()
                .sessionId(sessionId.toString())
                .uploadUrl("/api/storage/upload/sessions/" + sessionId + "/chunk")
                .chunkSize(DEFAULT_CHUNK_SIZE)
                .totalChunks(totalChunks)
                .build();
    }
}