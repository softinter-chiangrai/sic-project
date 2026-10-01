package com.softinter.sicapi.dto.response;

import lombok.Data;

@Data
public class TestCaseDraftResponse {
    private String title;
    private String priority;
    private String testStep;
    private String expectedResult;
    private String testCaseCode;
    private String testType;
    private String testDate;
    private String tester;
    private String relatedRequirement;
    private String relatedSpec;
    private String relatedTask;
}
