package com.softinter.sicapi.dto.request;

import lombok.Data;
import java.util.UUID;

@Data
public class GenerateTestCaseDraftRequest {
    private UUID projectId;
    private UUID taskId;
    private UUID requirementId;
    private UUID scenarioId;
    private String title;
    private String prompt;
}
