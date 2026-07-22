package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class PmTestCaseResponse {
    private UUID id;
    private UUID scenarioId;
    private String scenarioName;
    private String testCaseCode;
    private String testStep;
    private String expectedResult;
    private String actualResult;
    private String testStatus;
    private String tester;
    private Instant testDate;
    private String relatedRequirement;
    private String relatedSpec;
    private String relatedTask;
    private Instant createdDate;
    private Instant updatedDate;
    private Integer rowVersion;
}