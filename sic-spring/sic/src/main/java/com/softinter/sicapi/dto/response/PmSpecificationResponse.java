package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class PmSpecificationResponse {
    private UUID id;
    private UUID projectId;
    private String projectName;
    private UUID requirementId;
    private String requirementName;
    private String specCode;
    private String specType;
    private String title;
    private String description;
    private String relatedRequirement;
    private String relatedDiagram;
    private String uiAction;
    private String validationRule;
    private String permission;
    private Integer estimatedManday;
    private String dependency;
    private String status;
    private String version;
    private Boolean isActive;
    private Integer rowVersion;
    private String approvalStatus;  // maybe null if not submitted
}