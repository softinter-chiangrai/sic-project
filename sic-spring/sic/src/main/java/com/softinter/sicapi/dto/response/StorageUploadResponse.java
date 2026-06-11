package com.softinter.sicapi.dto.response;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorageUploadResponse {
    private UUID id;
    private String fileName;
    private String fileUrl;
    private long fileSize;
    private String mimeType;
    private UUID uploadGroupId;
}
