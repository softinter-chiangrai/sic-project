package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class PmSpecificationRequest {

    private UUID id;

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotBlank(message = "Spec code is required")
    private String specCode;

    @NotBlank(message = "Spec type is required")
    private String specType;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    // ===== Traceability =====
    private UUID requirementId;      // เชื่อมกับ Requirement
    private UUID erId;               // เชื่อมกับ ER Diagram

    private String relatedRequirement; // เก็บข้อความ (ถ้ามี)
    private String relatedEr;
    private String uiAction;
    private String validationRule;
    private String permission;
    private Integer estimatedManday;
    private String dependency;
    private String status;

    private Integer state;
    private Integer rowVersion;
}