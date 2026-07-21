// src/main/java/com/softinter/sicapi/dto/response/ChangeRequestResponse.java
package com.softinter.sicapi.dto.response;

import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
public class ChangeRequestResponse {
    private UUID id;
    private String changeDescription;
    private String impactSummary;
    private Integer estimatedManday;
    private String status;
    private UUID requirementId;
    private String requirementCode;
    private UUID projectId;
    private String projectName; // จะถูก set จาก requirement.project
    private Instant createdDate;
}