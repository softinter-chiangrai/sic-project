package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class PmRequirementRequest {
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
    private String createdBy;
    private String version;
    private String status;
    private Boolean isActive;
    private Integer state;
    private Integer rowVersion;
}