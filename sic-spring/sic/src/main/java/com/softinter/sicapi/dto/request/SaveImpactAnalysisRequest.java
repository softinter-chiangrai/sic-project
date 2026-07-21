// src/main/java/com/softinter/sicapi/dto/request/SaveImpactAnalysisRequest.java
package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class SaveImpactAnalysisRequest {

    @NotNull(message = "Change Request ID is required")
    private UUID changeRequestId;

    private String dfdImpact;
    private String erImpact;
    private String uiImpact;
    private String apiImpact;
    private String testImpact;
    private Integer mandayImpact;
    private Integer timelineImpact;
    private String costImpact;

    // สำหรับบันทึกผล Auto-Detect (ส่งจาก Frontend หรือ Service)
    private UUID[] impactedRequirementIds;
    private UUID[] impactedSpecIds;
    private UUID[] impactedTaskIds;
    private UUID[] impactedTestCaseIds;
    private UUID[] impactedBugIds;
    private String[] impactedTableNames;
}