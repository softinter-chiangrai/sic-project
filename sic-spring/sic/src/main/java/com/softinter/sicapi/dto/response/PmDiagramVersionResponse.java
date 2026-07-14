package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class PmDiagramVersionResponse {
    private UUID id;
    private UUID diagramId;
    private String mermaidScript;
    private Integer versionNumber;
    private String changeComment;
    private String createdBy;
    private Instant createdDate;
}