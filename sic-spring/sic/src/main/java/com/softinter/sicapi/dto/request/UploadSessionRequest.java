package com.softinter.sicapi.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
public class UploadSessionRequest {
    private String fileName;
    private Long fileSize;
    private String contentType;      // frontend ส่ง "contentType"
    private Integer category;        // ordinal ของ FileCategory (0,1,2)
    private Integer visibility;      // code 1,2,3,4
    private Integer chunkSize;
    private UUID uploadGroupId;
}