package com.softinter.sicapi.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import lombok.Data;

@Data
public class WorkPackageResponse {
    private UUID id;
    private UUID milestoneId;
    private String milestoneName;
    private String packageName;
    private String description;
    private Instant startDate;
    private Instant endDate;
    private String status;
    private List<TaskResponse> tasks;
}