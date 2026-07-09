package com.softinter.sicapi.dto.response;

import com.softinter.sicapi.entity.enums.ApprovalStatus;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class ApprovalStepResponse {
    private UUID id;
    private UUID stepId;
    private Integer stepOrder;
    private String stepName;
    private String approverRole;
    private String approverUserId;
    private String approverName;
    private ApprovalStatus status;
    private String statusText;
    private String statusColor;
    private Instant approvalDate;
    private String comment;
    private boolean isCurrent;
    private boolean isComplete;
    private Boolean isRequired;
    private Integer timeoutDays;
}