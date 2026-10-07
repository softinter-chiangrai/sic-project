package com.softinter.sicapi.dto.request;

import java.util.List;
import java.util.UUID;

import lombok.Data;

@Data
public class AiBatchGenerateRequest implements AiDraftRequest {
    private String moduleType;
    private String prompt;
    private Integer count;
    private UUID projectId;
    private String model;
    private List<AiAttachmentDto> attachments;
}
