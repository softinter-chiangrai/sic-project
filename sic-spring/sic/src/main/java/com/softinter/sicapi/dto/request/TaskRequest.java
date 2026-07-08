package com.softinter.sicapi.dto.request;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import lombok.Data;

@Data
public class TaskRequest {
    private UUID workPackageId;
    private String taskCode;
    private String taskName;
    private String description;
    private String assignedTo;
    private Instant startDate;
    private Instant endDate;
    private Integer estimateManday;
    private String priority;
    private String color;
    private List<String> assigneeIds;
}