package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

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
    private String createdBy;
    private String version;
    private String status;
    private Boolean isActive;
    private Instant createdDate;
    private Instant updatedDate;
    private Integer rowVersion;
}