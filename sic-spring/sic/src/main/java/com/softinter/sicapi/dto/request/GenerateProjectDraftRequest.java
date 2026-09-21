package com.softinter.sicapi.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateProjectDraftRequest implements AiDraftRequest {
    private UUID customerId;
    private String projectCode;
    private String projectName;
    private String prompt;
    private String model;
    private List<AiAttachmentDto> attachments;
}
