package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class ImpactAnalysisHistoryResponse {
    private UUID id;
    private UUID changeRequestId;
    private UUID analysisId;
    private String analysisStatus;
    private Integer versionNo;
    private Integer mandayImpact;
    private Integer timelineImpact;
    private String aiRationale;
    private Instant analyzedAt;
    private String analyzedBy;
    private Instant createdDate;

    // Counts of impacted documents
    private int requirementCount;
    private int specCount;
    private int diagramCount;
    private int taskCount;
    private int testCaseCount;
    private int bugCount;
    private int projectCount;
    private int customerCount;

    // Full snapshot
    private ImpactAnalysisResponse snapshot;
}
