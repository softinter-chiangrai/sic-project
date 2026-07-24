package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class PmSpecificationRequest {
    private UUID id;
    private Integer state;
    private Integer rowVersion;

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    private UUID requirementId;   // optional

    @NotBlank(message = "Spec code is required")
    private String specCode;

    @NotBlank(message = "Spec type is required")
    private String specType;

    @NotBlank(message = "Title is required")
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
}