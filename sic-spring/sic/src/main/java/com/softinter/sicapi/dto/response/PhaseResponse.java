package com.softinter.sicapi.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import lombok.Data;

@Data
public class PhaseResponse {
    private UUID id;
    private UUID projectId;
    private String projectName;
    private String phaseName;
    private String description;
    private Instant startDate;
    private Instant endDate;
    private String color;
    private String owner;
    private String status;
    private Integer progress;
    private UUID dependencyId;
    private String dependencyName;
    private List<MilestoneResponse> milestones;
    private Integer milestoneCount;
    private Integer taskCount;
    private Integer taskCompletedCount;
}