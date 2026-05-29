package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UserTaskResponse {
    private UUID id;
    private String userId;
    private UUID taskId;
    private String taskCode;
    private String taskName;
    private UUID businessId;
    private String assignedBy;
    private LocalDateTime assignedAt;
    private LocalDateTime completedAt;
    private boolean isCompleted;
    private boolean isActive;
}
