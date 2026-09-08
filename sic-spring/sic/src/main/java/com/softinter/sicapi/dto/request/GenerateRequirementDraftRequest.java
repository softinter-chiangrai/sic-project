package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class GenerateRequirementDraftRequest {
    private UUID projectId;
    private String title;
    private String prompt;
    private String requirementType;
}
