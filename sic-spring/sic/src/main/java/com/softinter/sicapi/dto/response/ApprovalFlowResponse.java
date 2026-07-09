package com.softinter.sicapi.dto.response;

import java.util.List;
import java.util.UUID;

import com.softinter.sicapi.entity.enums.ApprovalMode;

import lombok.Data;

@Data
public class ApprovalFlowResponse {
    private UUID id;
    private String flowCode;
    private String flowName;
    private String documentType;
    private String documentTypeDisplay;
    private ApprovalMode approvalMode;
    private String approvalModeDisplay;
    private String description;
    private boolean isActive;
    private List<ApprovalFlowStepResponse> steps;
}