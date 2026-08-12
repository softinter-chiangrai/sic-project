package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class DocumentVersionResponse {
    private UUID id;
    private String documentType;
    private UUID documentId;
    private String versionNo;
    private String changeSummary;
    private String filePath;
    private Boolean isActive;
    private String createdBy;
    private Instant createdDate;
    private String updatedBy;
    private Instant updatedDate;
}