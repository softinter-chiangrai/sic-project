package com.softinter.sicapi.entity.ex;

import java.util.UUID;

import com.softinter.sicapi.entity.enums.EntityState;

import lombok.Data;

@Data
public class StorageUploadReference {
    private UUID id;
    private UUID uploadGroupId;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private String accessUrl;
    private Boolean isActive;
    private Boolean isStreaming = false;   
    private String visibility;             
    private Integer state;
}
