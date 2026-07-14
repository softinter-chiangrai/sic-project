package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

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

    private String metadata;
    private Integer sortOrder;
    private Boolean isActive;
}