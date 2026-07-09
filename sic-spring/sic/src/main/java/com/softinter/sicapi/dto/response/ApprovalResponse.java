package com.softinter.sicapi.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.softinter.sicapi.entity.enums.ApprovalStatus;

import lombok.Data;

@Data
public class ApprovalResponse {
    private UUID id;
    private String documentType;
    private UUID documentId;
    private String documentCode;
    private String documentTitle;
    private String version;
    private String requestedBy;
    private String requestedByName;
    private Instant requestedDate;
    private ApprovalStatus status;
    private String statusText;
    private String statusColor;

    private ApprovalStepResponse currentStep;
    private List<ApprovalStepResponse> steps;
    private List<ApprovalLogResponse> logs;

    private String finalApprover;
    private String finalApproverName;
    private Instant finalApprovalDate;

    private String comment;
    private boolean canApprove;
    private boolean canReject;
    private boolean canRevise;
    private boolean canCancel;
    private String approverHint;

    private String flowCode;
    private String flowName;
    private String approvalMode;
}