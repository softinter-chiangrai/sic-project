package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class GenerateSpecDraftRequest {
    private UUID projectId;
    private UUID requirementId;
    private UUID diagramId;
    private String specificationType;
    private String prompt;
}
