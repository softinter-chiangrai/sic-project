package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class StorageUploadResponse {
    private UUID id;
    private String fileName;
    private String fileUrl;
    private long fileSize;
    private String mimeType;
    private UUID uploadGroupId;
}
