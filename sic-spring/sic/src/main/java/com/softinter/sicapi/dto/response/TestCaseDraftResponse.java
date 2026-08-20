package com.softinter.sicapi.dto.response;

import lombok.Data;

@Data
public class TestCaseDraftResponse {
    private String title;
    private String priority;
    private String testStep;
    private String expectedResult;
    private String testCaseCode;
}
