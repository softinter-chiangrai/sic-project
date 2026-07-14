package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class PmDiagramProjectResponse {
    private UUID id;
    private String name;
    private String description;
    private Boolean isFavorite;
    private Instant lastOpened;
    private Instant createdDate;
    private Instant updatedDate;
    private Integer tabCount;
    private List<PmDiagramTabResponse> tabs;
}