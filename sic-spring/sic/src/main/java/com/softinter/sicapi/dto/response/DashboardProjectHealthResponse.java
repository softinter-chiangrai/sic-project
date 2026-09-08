package com.softinter.sicapi.dto.response;

import java.util.UUID;

import lombok.Data;

@Data
public class DashboardProjectHealthResponse {
    private UUID projectId;
    private String projectCode;
    private String projectName;
    private String status;
    private int score;
    private String healthStatus; // Green / Yellow / Red
}
