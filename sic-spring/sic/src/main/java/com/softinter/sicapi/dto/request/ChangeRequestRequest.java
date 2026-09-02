package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ChangeRequestRequest {
    private UUID id;
    private UUID projectId;
    private String crCode;
    @NotBlank(message = "Target type is required")
    private String targetType;
    @NotNull(message = "Target ID is required")
    private UUID targetId;
    @NotBlank(message = "Title is required")
    private String title;
    private String description;
    private String changeReason;
    private String assigneeId;
    private List<CrAssigneeRequest> assignees;
    private String targetVersion;
    private String status;
}