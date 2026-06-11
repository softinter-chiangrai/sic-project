package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.UploadSessionRequest;
import com.softinter.sicapi.dto.response.StorageDownloadResponse;
import com.softinter.sicapi.dto.response.StorageUploadResponse;
import com.softinter.sicapi.dto.response.UploadSessionResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

public interface FileStorageService {
    // Single file upload
    StorageUploadResponse uploadFile(MultipartFile file, String category, String visibility, UUID uploadGroupId);
    StorageDownloadResponse downloadFile(UUID fileId);
    void deleteFile(UUID fileId);
    String getFileUrl(UUID fileId);

    // Resumable upload session
    UploadSessionResponse createUploadSession(UploadSessionRequest request);
    StorageUploadResponse completeUploadSession(UUID sessionId);
    StorageUploadResponse completeUploadSession(UUID sessionId, jakarta.servlet.http.HttpServletRequest request); // overload

    // Additional methods for .NET compatibility
    UploadSessionResponse uploadChunk(UUID sessionId, int chunkIndex, MultipartFile chunk);
    void cancelSession(UUID sessionId);
    void activateUpload(UUID uploadId);
    StorageDownloadResponse downloadByKey(String bucketName, String objectKey);
}