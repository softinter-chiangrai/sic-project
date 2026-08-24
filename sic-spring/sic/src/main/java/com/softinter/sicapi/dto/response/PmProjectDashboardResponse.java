package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class PmProjectDashboardResponse {
    private UUID id;
    private String projectCode;
    private String projectName;
    private UUID customerId;
    private String customerName;
    private UUID contractId;
    private String contractNo;
    private String projectManager;
    private String ba;
    private String sa;
    private Instant startDate;
    private Instant plannedEndDate;
    private Instant actualEndDate;
    private Integer budgetManday;
    private Integer usedManday;
    private String status;
    private String priority;
    private String description;
    private Boolean isActive;
    private Integer rowVersion;

    private Integer phaseCount;
    private Integer taskCount;
    private Integer taskCompletedCount;
    private Integer requirementCount;
    private Integer bugCount;
    private Integer bugOpenCount;

    private List<PmProjectDashboardPhaseSummary> recentPhases;
    private List<PmProjectDashboardTaskSummary> recentTasks;
}
