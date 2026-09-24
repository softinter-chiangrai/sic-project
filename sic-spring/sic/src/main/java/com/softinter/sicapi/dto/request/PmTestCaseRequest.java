package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PmTestCaseRequest {

    private UUID id;
    private UUID projectId;
    private UUID scenarioId;
    private String scenarioName;

    @NotBlank(message = "Test case code is required")
    private String testCaseCode;

    private String title;
    private String priority;

    @NotBlank(message = "Test step is required")
    private String testStep;

    @NotBlank(message = "Expected result is required")
    private String expectedResult;

    private String actualResult;
    private String testStatus;
    private String testType;
    private String tester;
    private LocalDate testDate;

    public LocalDate getTestDate() {
        return this.testDate;
    }

    public void setTestDate(LocalDate testDate) {
        this.testDate = testDate;
    }
    private String relatedRequirement;
    private String relatedSpec;
    private String relatedTask;

    // ===== Traceability =====
    private UUID taskId;   // เชื่อมกับ Task

    private Integer state;
    private Integer rowVersion;
}