package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class PmDiagramTabResponse {
    private UUID id;
    private String name;
    private String diagramType;
    private String mermaidScript;
    private String metadata;
    private UUID projectId;
    private String projectName;
    private Integer sortOrder;
    private Boolean isActive;
    private Instant createdDate;
    private Instant updatedDate;
    private Integer versionCount;
}