package com.softinter.sicapi.dto.request;

import lombok.Data;
import java.util.UUID;

@Data
public class GenerateTestScenarioDraftRequest {
    private UUID projectId;
    private UUID taskId;
    private UUID requirementId;
    private String scenarioName;
    private String prompt;
}
