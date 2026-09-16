package com.softinter.sicapi.dto.response;

import java.time.LocalDate;
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
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String color;
    private List<TaskResponse> tasks;
}