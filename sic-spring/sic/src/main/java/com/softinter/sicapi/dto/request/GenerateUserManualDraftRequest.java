package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class GenerateUserManualDraftRequest {
    private UUID projectId;
    private String manualTitle;
    private String manualType; // USER, ADMIN, INSTALLATION, OPERATION, TROUBLESHOOT
    private List<UUID> requirementIds;
    private List<UUID> specificationIds;
    private String prompt;
}
