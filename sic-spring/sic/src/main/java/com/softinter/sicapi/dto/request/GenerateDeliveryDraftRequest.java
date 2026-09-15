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
public class GenerateDeliveryDraftRequest {
    private UUID projectId;
    private String deliveryTitle;
    private String deliveryType;
    private String prompt;
    private String model;
}
