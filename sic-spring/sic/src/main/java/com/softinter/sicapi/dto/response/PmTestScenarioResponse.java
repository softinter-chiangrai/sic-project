package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class PmTestScenarioResponse {
    private UUID id;
    private UUID projectId;
    private UUID testPlanId;
    private UUID taskId;
    private String taskCode;
    private String taskName;
    private String scenarioCode;
    private String scenarioName;
    private String priority;
    private String description;
    private String status;
    private Instant createdDate;
    private Instant updatedDate;
    private Integer rowVersion;
}
