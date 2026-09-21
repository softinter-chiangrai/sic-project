package com.softinter.sicapi.dto.request;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class GenerateTestCaseDraftRequest implements AiDraftRequest {
    private UUID projectId;
    private UUID taskId;
    private UUID requirementId;
    private UUID scenarioId;
    private String title;
    private String prompt;
    private String model;
    private List<AiAttachmentDto> attachments;
}
