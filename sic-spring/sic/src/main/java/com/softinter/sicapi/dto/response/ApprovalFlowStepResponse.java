package com.softinter.sicapi.dto.response;

import java.util.UUID;

import lombok.Data;

import lombok.Data;

@Data
public class ApprovalFlowStepResponse {
    private UUID id;
    private Integer stepOrder;
    private String stepName;
    private String approverRole;
    private String approverUserId;
    private Boolean isRequired;
    private Integer timeoutDays;
    private Boolean canSkip;
    private String conditionExpression;
}

