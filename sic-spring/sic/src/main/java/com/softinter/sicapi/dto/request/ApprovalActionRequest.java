package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ApprovalActionRequest {

    @NotNull(message = "Approval ID is required")
    private UUID approvalId;

    private String comment;
    private String signature;

    // For delegate action
    private String delegateToUserId;
}