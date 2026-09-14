package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class PmTestScenarioRequest {

    private UUID id;
    private UUID projectId;
    private UUID testPlanId;

    @NotNull(message = "Task is required")
    private UUID taskId;

    @NotBlank(message = "Scenario code is required")
    private String scenarioCode;

    @NotBlank(message = "Scenario name is required")
    private String scenarioName;

    private String priority;
    private String description;
    private String status;
    private String testType;

    private Integer state;
    private Integer rowVersion;
}
