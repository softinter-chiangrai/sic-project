package com.softinter.sicapi.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateContractDraftRequest implements AiDraftRequest {
    private UUID projectId;
    private UUID customerId;
    private String contractNo;
    private String contractType;
    private BigDecimal contractValue;
    private String prompt;
    private String model;
    private List<AiAttachmentDto> attachments;
}
