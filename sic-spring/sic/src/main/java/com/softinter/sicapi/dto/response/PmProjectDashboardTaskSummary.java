package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class PmProjectDashboardTaskSummary {
    private UUID id;
    private String taskCode;
    private String taskName;
    private String assignedTo;
    private String status;
    private String priority;
}
