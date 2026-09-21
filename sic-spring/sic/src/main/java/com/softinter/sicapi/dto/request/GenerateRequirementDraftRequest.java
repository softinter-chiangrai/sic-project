package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class GenerateRequirementDraftRequest implements AiDraftRequest {
    private UUID projectId;
    private String title;
    private String prompt;
    private String requirementType;
    private String model;
    private List<AiAttachmentDto> attachments;
}
