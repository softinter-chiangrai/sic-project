package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class PmDiagramTabRequest {
    private UUID id;

    @NotBlank(message = "Diagram name is required")
    private String name;

    @NotBlank(message = "Diagram type is required")
    private String diagramType;  // "DFD", "ER", "Flowchart", etc.

    private String mermaidScript;

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    private Map<String, Object> metadata;
    private Map<String, Object> graphData;
    private Integer sortOrder;
    private Boolean isActive;

    // ===== Traceability Fields =====
    // สำหรับ DFD: เชื่อมกับ Requirement
    private List<UUID> relatedRequirementIds;

    // สำหรับ ER: เชื่อมกับ DFD
    private List<UUID> relatedDfdIds;

    // ทั่วไป: ER เชื่อมกับ Requirement โดยตรง
    private List<UUID> relatedRequirementIdsForEr;

    private Integer state;
    private Integer rowVersion;
}