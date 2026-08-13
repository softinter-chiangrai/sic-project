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

    @NotBlank(message = "รหัส Specification ห้ามว่าง")
    private String specificationCode;

    @NotBlank(message = "ชื่อเรื่องห้ามว่าง")
    private String title;

    private String specificationType;
    private String module;
    private String version;
    private String status;
    private String priority;
    private String owner;
    private Integer estimatedManday;

    @NotBlank(message = "กรุณาระบุเนื้อหา")
    private String description;  // HTML จาก Tiptap Editor

    private UUID uploadGroupId;
    private Boolean isActive;

    // ===== Traceability =====
    private UUID requirementId;
    private UUID generatedFromRequirementId;
    private UUID generatedFromDiagramId;

    // ===== Project =====
    @NotNull(message = "กรุณาเลือกโครงการ")
    private UUID projectId;

}