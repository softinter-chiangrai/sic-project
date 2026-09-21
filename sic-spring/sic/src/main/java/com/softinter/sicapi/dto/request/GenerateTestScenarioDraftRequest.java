package com.softinter.sicapi.dto.request;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class GenerateTestScenarioDraftRequest implements AiDraftRequest {
    private UUID projectId;
    private UUID taskId;
    private UUID requirementId;
    private String scenarioName;
    private String prompt;
    private String model;
    private List<AiAttachmentDto> attachments;
}
