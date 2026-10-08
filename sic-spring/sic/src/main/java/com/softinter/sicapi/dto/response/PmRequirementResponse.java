package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;
import java.util.List;
import com.softinter.sicapi.entity.ex.StorageUploadReference;

@Data
public class PmRequirementResponse {
    private UUID id;
    private String requirementCode;
    private String title;
    private String description;
    private String requirementType;
    private String source;
    private String priority;
    private String businessValue;
    private String acceptanceCriteria;
    private UUID projectId;
    private String projectName;
    private UUID customerId;
    private String customerName;
    private String createdBy;
    private String version;
    private String status;
    private Boolean isLocked;
    private Boolean isActive;
    private Instant createdDate;
    private Instant updatedDate;
    private Integer rowVersion;
    private UUID uploadGroupId;
    private List<StorageUploadReference> uploadGroupData;
}