package com.softinter.sicapi.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Data
public class StorageUploadRequest {
    private MultipartFile file;
    private String fileCategory;
    private String fileVisibility;
    private UUID uploadGroupId;
}
