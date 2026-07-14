// File: sic-spring/sic/src/main/java/com/softinter/sicapi/dto/request/PmDiagramTabRequest.java
package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;
import java.util.UUID;

@Data
public class PmDiagramTabRequest {
    private UUID id;

    @NotBlank(message = "Diagram name is required")
    private String name;

    @NotBlank(message = "Diagram type is required")
    private String diagramType;

    private String mermaidScript;

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    // เปลี่ยนจาก String เป็น Map<String, Object> เพื่อรองรับ JSONB ได้โดยตรง
    private Map<String, Object> metadata;

    private Integer sortOrder;
    private Boolean isActive;
}