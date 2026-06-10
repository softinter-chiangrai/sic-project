package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.response.StorageDownloadResponse;
import com.softinter.sicapi.dto.response.StorageUploadResponse;
import org.springframework.web.multipart.MultipartFile;
import com.softinter.sicapi.dto.request.UploadSessionRequest;
import com.softinter.sicapi.dto.response.UploadSessionResponse;
import java.util.UUID;

public interface FileStorageService {
    StorageUploadResponse uploadFile(MultipartFile file, String category, String visibility, UUID uploadGroupId);
    StorageDownloadResponse downloadFile(UUID fileId);
    void deleteFile(UUID fileId);
    String getFileUrl(UUID fileId);
    UploadSessionResponse createUploadSession(UploadSessionRequest request);
}
