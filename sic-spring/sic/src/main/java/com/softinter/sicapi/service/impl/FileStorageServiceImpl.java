package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.response.StorageDownloadResponse;
import com.softinter.sicapi.dto.response.StorageUploadResponse;
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
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageServiceImpl implements FileStorageService {

    private final S3Client s3Client;
    private final SuUploadRepository uploadRepository;

    @Value("${app.storage.s3.bucket}")
    private String bucketName;

    @Override
    public StorageUploadResponse uploadFile(MultipartFile file, String category, String visibility, UUID uploadGroupId) {
        try {
            String fileName = file.getOriginalFilename();
            String key = UUID.randomUUID() + "_" + fileName;

            s3Client.putObject(PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            SuUpload upload = new SuUpload();
            upload.setFileName(fileName);
            upload.setFilePath(key);
            upload.setFileSize(file.getSize());
            upload.setMimeType(file.getContentType());
            upload.setFileCategory(category);
            upload.setFileVisibility(visibility);
            upload.setUploadGroupId(uploadGroupId);
            upload.setIsActive(true);
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
                    .key(upload.getFilePath())
                    .build());

            StorageDownloadResponse response = new StorageDownloadResponse();
            response.setInputStream(s3Object);
            response.setFileName(upload.getFileName());
            response.setContentType(upload.getMimeType());
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
                    .key(upload.getFilePath())
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
                builder.bucket(bucketName).key(upload.getFilePath())).toExternalForm();
    }
}
