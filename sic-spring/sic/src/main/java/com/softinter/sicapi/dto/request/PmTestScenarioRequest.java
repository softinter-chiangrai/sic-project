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

    private String scenarioCode;

    @NotBlank(message = "Scenario name is required")
    private String scenarioName;

    private String priority;
    private String description;
    private String status;

    private Integer state;
    private Integer rowVersion;
}
