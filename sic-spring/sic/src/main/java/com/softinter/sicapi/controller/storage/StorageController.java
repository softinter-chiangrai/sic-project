package com.softinter.sicapi.controller.storage;

import com.softinter.sicapi.dto.request.CompleteUploadSessionRequest;
import com.softinter.sicapi.dto.request.UploadSessionRequest;
import com.softinter.sicapi.dto.response.StorageDownloadResponse;
import com.softinter.sicapi.dto.response.StorageUploadResponse;
import com.softinter.sicapi.dto.response.UploadSessionResponse;
import com.softinter.sicapi.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/storage")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Storage", description = "File Storage API")
public class StorageController {

    private final FileStorageService fileStorageService;

    // ========== Single file upload ==========
    @PostMapping("/upload/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file,
                                         @RequestParam(required = false) String visibility,
                                         @RequestParam(required = false) UUID uploadGroupId) {
        StorageUploadResponse res = fileStorageService.uploadFile(file, "IMAGE", visibility, uploadGroupId);
        return ResponseEntity.ok(Map.of(
                "id", res.getId(),
                "accessUrl", res.getFileUrl(),
                "fileName", res.getFileName(),
                "fileSize", res.getFileSize(),
                "contentType", res.getMimeType()
        ));
    }

    @PostMapping("/upload/video")
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file,
                                         @RequestParam(required = false) String visibility,
                                         @RequestParam(required = false) UUID uploadGroupId) {
        StorageUploadResponse res = fileStorageService.uploadFile(file, "VIDEO", visibility, uploadGroupId);
        return ResponseEntity.ok(Map.of(
                "id", res.getId(),
                "accessUrl", res.getFileUrl(),
                "fileName", res.getFileName(),
                "fileSize", res.getFileSize(),
                "contentType", res.getMimeType()
        ));
    }

    @PostMapping("/upload/document")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file,
                                            @RequestParam(required = false) String visibility,
                                            @RequestParam(required = false) UUID uploadGroupId) {
        StorageUploadResponse res = fileStorageService.uploadFile(file, "DOCUMENT", visibility, uploadGroupId);
        return ResponseEntity.ok(Map.of(
                "id", res.getId(),
                "accessUrl", res.getFileUrl(),
                "fileName", res.getFileName(),
                "fileSize", res.getFileSize(),
                "contentType", res.getMimeType()
        ));
    }

    // ========== Resumable upload session ==========
    @PostMapping("/upload/sessions")
    @Operation(summary = "Create upload session")
    public ResponseEntity<UploadSessionResponse> createUploadSession(@RequestBody UploadSessionRequest request) {
        UploadSessionResponse response = fileStorageService.createUploadSession(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/upload/sessions/{sessionId}")
    @Operation(summary = "Get session status")
    public ResponseEntity<Map<String, Object>> getSessionStatus(@PathVariable UUID sessionId) {
        // TODO: implement status response
        return ResponseEntity.ok(Map.of("sessionId", sessionId));
    }

    @PostMapping("/upload/sessions/{sessionId}/chunks/{chunkIndex}")
    @Operation(summary = "Upload a chunk")
    public ResponseEntity<UploadSessionResponse> uploadChunk(
            @PathVariable UUID sessionId,
            @PathVariable int chunkIndex,
            @RequestParam("chunk") MultipartFile chunk) {
        UploadSessionResponse response = fileStorageService.uploadChunk(sessionId, chunkIndex, chunk);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload/sessions/{sessionId}/complete")
    @Operation(summary = "Complete upload session (using path variable)")
    public ResponseEntity<StorageUploadResponse> completeUploadSession(@PathVariable UUID sessionId,
                                                                       HttpServletRequest request) {
        StorageUploadResponse response = fileStorageService.completeUploadSession(sessionId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/upload/sessions/{sessionId}")
    @Operation(summary = "Cancel upload session")
    public ResponseEntity<Void> cancelSession(@PathVariable UUID sessionId) {
        fileStorageService.cancelSession(sessionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/uploads/{uploadId}/activate")
    @Operation(summary = "Activate upload")
    public ResponseEntity<Void> activateUpload(@PathVariable UUID uploadId) {
        fileStorageService.activateUpload(uploadId);
        return ResponseEntity.noContent().build();
    }

    // ========== Legacy endpoint: complete session using request body (sessionId) ==========
    @PostMapping("/upload/sessions/complete")
    @Operation(summary = "Complete upload session (using sessionId in request body)")
    public ResponseEntity<?> completeUploadSessionLegacy(@RequestBody CompleteUploadSessionRequest request,
                                                         HttpServletRequest httpRequest) {
        if (request == null || request.getSessionId() == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "sessionId is required in request body"));
        }
        StorageUploadResponse response = fileStorageService.completeUploadSession(request.getSessionId(), httpRequest);
        return ResponseEntity.ok(response);
    }

    // ========== Download ==========
    @GetMapping("/download/{fileId}")
    @Operation(summary = "Download file by ID")
    public ResponseEntity<org.springframework.core.io.Resource> download(@PathVariable UUID fileId) {
        StorageDownloadResponse download = fileStorageService.downloadFile(fileId);
        InputStreamResource resource = new InputStreamResource(download.getInputStream());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + download.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(download.getContentType()))
                .contentLength(download.getFileSize())
                .body(resource);
    }

    @GetMapping("/files/{bucketName}/{*objectKey}")
    @Operation(summary = "Download file by bucket and object key")
    public ResponseEntity<org.springframework.core.io.Resource> downloadByKey(@PathVariable String bucketName,
                                                                              @PathVariable String objectKey,
                                                                              @RequestParam(required = false) Integer width,
                                                                              @RequestParam(required = false) Integer height,
                                                                              HttpServletRequest request) {
        StorageDownloadResponse download = fileStorageService.downloadByKey(bucketName, objectKey);
        InputStreamResource resource = new InputStreamResource(download.getInputStream());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + download.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(download.getContentType()))
                .contentLength(download.getFileSize())
                .body(resource);
    }

    @DeleteMapping("/{fileId}")
    @Operation(summary = "Delete file")
    public ResponseEntity<Void> delete(@PathVariable UUID fileId) {
        fileStorageService.deleteFile(fileId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/url/{fileId}")
    @Operation(summary = "Get file URL")
    public ResponseEntity<String> getFileUrl(@PathVariable UUID fileId) {
        String url = fileStorageService.getFileUrl(fileId);
        return ResponseEntity.ok(url);
    }
}