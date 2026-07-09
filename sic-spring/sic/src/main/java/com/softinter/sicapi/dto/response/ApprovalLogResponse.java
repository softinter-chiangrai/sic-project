package com.softinter.sicapi.dto.response;

import com.softinter.sicapi.entity.enums.ApprovalStatus;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class ApprovalLogResponse {
    private UUID id;
    private String action;
    private String actor;
    private String actorName;
    private String comment;
    private ApprovalStatus oldStatus;
    private ApprovalStatus newStatus;
    private Instant createdDate;
    private String actionClass;
    private String actionIcon;
}