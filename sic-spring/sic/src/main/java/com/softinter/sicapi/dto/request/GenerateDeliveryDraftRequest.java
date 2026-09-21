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
public class GenerateDeliveryDraftRequest implements AiDraftRequest {
    private UUID projectId;
    private String deliveryTitle;
    private String deliveryType;
    private String prompt;
    private String model;
    private List<AiAttachmentDto> attachments;
}
