// sic-spring/sic/src/main/java/com/softinter/sicapi/dto/request/SaveApprovalFlowRequest.java
package com.softinter.sicapi.dto.request;

import com.softinter.sicapi.entity.enums.ApprovalMode;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class SaveApprovalFlowRequest {
    private UUID id;
    private String flowCode;
    private String flowName;
    private String documentType;
    private ApprovalMode approvalMode;
    private String description;
    private Boolean isActive;
    private Integer rowVersion;
    private List<SaveApprovalFlowStepRequest> steps;
}