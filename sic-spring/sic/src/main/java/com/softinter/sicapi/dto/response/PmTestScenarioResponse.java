package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class PmTestScenarioResponse {
    private UUID id;
    private UUID projectId;
    private UUID testPlanId;
    private String scenarioName;
    private String description;
    private String prerequisite;
    private String status;
    private Instant createdDate;
    private Instant updatedDate;
    private Integer rowVersion;
}
