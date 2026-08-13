package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class DocumentVersionResponse {
    private UUID id;
    private String documentType;
    private UUID documentId;
    private String documentCode;
    private UUID projectId;
    private String versionNo;
    private String changeSummary;
    private UUID previousVersionId;
    private String approvalStatus;
    private String approvedBy;
    private Instant approvedDate;
    private String snapshotData;
    private UUID fileRefId;
    private String filePath;
    private Boolean isActive;
    private Integer rowVersion;
    private String createdBy;
    private Instant createdDate;
    private String updatedBy;
    private Instant updatedDate;
}