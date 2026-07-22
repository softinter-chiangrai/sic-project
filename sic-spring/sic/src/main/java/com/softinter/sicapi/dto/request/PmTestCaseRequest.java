package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class PmTestCaseRequest {

    private UUID id;

    @NotNull(message = "Scenario ID is required")
    private UUID scenarioId;

    @NotBlank(message = "Test case code is required")
    private String testCaseCode;

    @NotBlank(message = "Test step is required")
    private String testStep;

    @NotBlank(message = "Expected result is required")
    private String expectedResult;

    private String actualResult;
    private String testStatus;
    private String tester;
    private Instant testDate;
    private String relatedRequirement;
    private String relatedSpec;
    private String relatedTask;

    // ===== Traceability =====
    private UUID taskId;   // เชื่อมกับ Task

    private Integer state;
    private Integer rowVersion;
}