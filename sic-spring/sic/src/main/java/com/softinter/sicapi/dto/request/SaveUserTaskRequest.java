package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class SaveUserTaskRequest {
    private UUID id;
    private String userId;
    private UUID taskId;
    private UUID businessId;
    private String assignedBy;
    private boolean isCompleted = false;
    private boolean isActive = true;
}
