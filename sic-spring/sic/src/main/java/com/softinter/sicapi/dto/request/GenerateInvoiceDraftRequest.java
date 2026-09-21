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
public class GenerateInvoiceDraftRequest implements AiDraftRequest {
    private UUID projectId;
    private UUID contractId;
    private String invoiceType;
    private String invoiceTitle;
    private String billingPeriod;
    private String prompt;
    private String model;
    private List<AiAttachmentDto> attachments;
}
