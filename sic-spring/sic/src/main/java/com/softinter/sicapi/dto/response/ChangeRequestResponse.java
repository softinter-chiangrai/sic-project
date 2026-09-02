package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class ChangeRequestResponse {
    private UUID id;
    private String crCode;
    private UUID projectId;
    private String projectName;
    private String targetType;
    private UUID targetId;
    private String title;
    private String description;
    private String changeReason;
    private String requesterId;
    private String requesterName;
    private String assigneeId;
    private String assigneeName;
    private String status;
    private String targetVersion;
    private String approvedBy;
    private Instant approvedAt;
    private Instant implementedAt;
    private Instant createdDate;
    private List<CrAssigneeResponse> assignees;
    private List<ChangeImpactResponse> impacts;
}