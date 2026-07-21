// src/main/java/com/softinter/sicapi/dto/response/ImpactAnalysisResponse.java
package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class ImpactAnalysisResponse {
    private UUID id;
    private UUID changeRequestId;

    private String dfdImpact;
    private String erImpact;
    private String uiImpact;
    private String apiImpact;
    private String testImpact;
    private Integer mandayImpact;
    private Integer timelineImpact;
    private String costImpact;

    private UUID[] impactedRequirementIds;
    private UUID[] impactedSpecIds;
    private UUID[] impactedTaskIds;
    private UUID[] impactedTestCaseIds;
    private UUID[] impactedBugIds;
    private String[] impactedTableNames;

    private String analysisStatus; // AUTO / MANUAL
    private Instant analyzedAt;
    private String analyzedBy;
}