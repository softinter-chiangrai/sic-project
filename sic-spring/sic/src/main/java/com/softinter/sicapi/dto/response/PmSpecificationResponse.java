package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class PmSpecificationResponse {

    private UUID id;
    private String specificationCode;
    private String specificationType;
    private String title;
    private String module;
    private String version;
    private String status;
    private String priority;
    private String owner;
    private Integer estimatedManday;
    private String description;  // HTML จาก Tiptap Editor
    private UUID uploadGroupId;
    private Boolean isActive;

    // ===== Traceability =====
    private Boolean isAiGenerated;
    private Instant aiGeneratedAt;
    private UUID generatedFromRequirementId;
    private UUID generatedFromDiagramId;

    // ===== Project & Requirement =====
    private UUID projectId;
    private String projectName;
    private UUID requirementId;
    private String requirementCode;
    private String requirementTitle;

    // ===== Metadata =====
    private String createdBy;
    private Integer rowVersion;
    private Instant createdDate;
    private Instant updatedDate;
}