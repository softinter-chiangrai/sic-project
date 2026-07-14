package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class PmDiagramProjectRequest {
    private UUID id;

    @NotBlank(message = "Project name is required")
    private String name;

    private String description;
    private Boolean isFavorite;
}