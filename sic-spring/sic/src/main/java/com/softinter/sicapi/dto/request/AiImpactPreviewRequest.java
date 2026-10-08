package com.softinter.sicapi.dto.request;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class AiImpactPreviewRequest implements AiDraftRequest {
    private String targetType;
    private UUID targetId;
    private String title;
    private String description;
    private String changeReason;
    private String changeLevel;
    private String priority;

    // AiDraftRequest fields
    private String prompt;
    private String model;
    private List<AiAttachmentDto> attachments;
}
