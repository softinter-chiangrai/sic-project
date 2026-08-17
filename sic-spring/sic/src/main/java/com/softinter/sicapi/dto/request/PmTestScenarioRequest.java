package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class PmTestScenarioRequest {

    private UUID id;
    private UUID projectId;
    private UUID testPlanId;
    private UUID taskId;

    @NotBlank(message = "Scenario name is required")
    private String scenarioName;

    private String description;
    private String prerequisite;
    private String status;

    private Integer state;
    private Integer rowVersion;
}
