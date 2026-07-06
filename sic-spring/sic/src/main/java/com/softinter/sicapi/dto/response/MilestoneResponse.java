package com.softinter.sicapi.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import lombok.Data;

@Data
public class MilestoneResponse {
    private UUID id;
    private UUID phaseId;
    private String phaseName;
    private String milestoneName;
    private String description;
    private Instant dueDate;
    private String status;
    private List<WorkPackageResponse> workPackages;
}