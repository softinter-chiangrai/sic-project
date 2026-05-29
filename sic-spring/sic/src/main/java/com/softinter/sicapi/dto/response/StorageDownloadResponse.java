package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.io.InputStream;

@Data
public class StorageDownloadResponse {
    private InputStream inputStream;
    private String fileName;
    private String contentType;
    private long fileSize;
}
