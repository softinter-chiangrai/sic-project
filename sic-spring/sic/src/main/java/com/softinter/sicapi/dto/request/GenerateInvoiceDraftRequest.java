package com.softinter.sicapi.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateInvoiceDraftRequest {
    private UUID projectId;
    private String invoiceTitle;
    private String billingPeriod;
    private String prompt;
    private String model;
}
