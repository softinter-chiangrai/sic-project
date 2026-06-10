package com.softinter.sicapi.controller.storage;

import com.softinter.sicapi.dto.request.UploadSessionRequest;
import com.softinter.sicapi.dto.response.ApiResponse;
import com.softinter.sicapi.dto.response.StorageDownloadResponse;
import com.softinter.sicapi.dto.response.StorageUploadResponse;
import com.softinter.sicapi.dto.response.UploadSessionResponse;
import com.softinter.sicapi.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/storage")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Storage", description = "File Storage API")
public class StorageController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    @Operation(summary = "Upload file")
    public ResponseEntity<ApiResponse<StorageUploadResponse>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String fileCategory,
            @RequestParam(required = false) String fileVisibility,
            @RequestParam(required = false) UUID uploadGroupId) {

        StorageUploadResponse response = fileStorageService.uploadFile(file, fileCategory, fileVisibility, uploadGroupId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/download/{fileId}")
    @Operation(summary = "Download file")
    public ResponseEntity<org.springframework.core.io.Resource> download(@PathVariable UUID fileId) {
        StorageDownloadResponse download = fileStorageService.downloadFile(fileId);
        InputStreamResource resource = new InputStreamResource(download.getInputStream());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + download.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(download.getContentType()))
                .contentLength(download.getFileSize())
                .body(resource);
    }

    @DeleteMapping("/{fileId}")
    @Operation(summary = "Delete file")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID fileId) {
        fileStorageService.deleteFile(fileId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/url/{fileId}")
    @Operation(summary = "Get file URL")
    public ResponseEntity<ApiResponse<String>> getFileUrl(@PathVariable UUID fileId) {
        String url = fileStorageService.getFileUrl(fileId);
        return ResponseEntity.ok(ApiResponse.success(url));
    }

    // ========== NEW ENDPOINT ==========
    @PostMapping("/upload/sessions")
    @Operation(summary = "Create upload session")
    public ResponseEntity<ApiResponse<UploadSessionResponse>> createUploadSession(
            @RequestBody UploadSessionRequest request) {
        UploadSessionResponse response = fileStorageService.createUploadSession(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}