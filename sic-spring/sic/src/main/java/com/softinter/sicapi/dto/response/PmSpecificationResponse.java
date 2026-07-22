package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class PmSpecificationResponse {
    private UUID id;
    private UUID projectId;
    private String projectName;
    private String specCode;
    private String specType;
    private String title;
    private String description;
    private String relatedRequirement;
    private String relatedEr;
    private String uiAction;
    private String validationRule;
    private String permission;
    private Integer estimatedManday;
    private String dependency;
    private String status;
    private Instant createdDate;
    private Instant updatedDate;
    private Integer rowVersion;
}