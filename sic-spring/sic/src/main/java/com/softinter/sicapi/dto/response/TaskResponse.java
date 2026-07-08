package com.softinter.sicapi.dto.response;

import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
public class TaskResponse {
    private UUID id;
    private UUID workPackageId;
    private String workPackageName;
    private String taskCode;
    private String taskName;
    private String description;
    private String assignedTo;
    private Instant startDate;
    private Instant endDate;
    private Instant actualStart;
    private Instant actualEnd;
    private Integer estimateManday;
    private Integer actualManday;
    private String status;
    private String color;
    private String priority;
}