package com.softinter.sicapi.dto.response;

import java.time.Instant;
import java.util.UUID;

import lombok.Data;

@Data
public class DashboardDeadlineResponse {
    private UUID taskId;
    private String taskCode;
    private String taskName;
    private UUID projectId;
    private String projectName;
    private Instant endDate;
    private long daysLeft;
    private String status;
    private boolean overdue;
}
