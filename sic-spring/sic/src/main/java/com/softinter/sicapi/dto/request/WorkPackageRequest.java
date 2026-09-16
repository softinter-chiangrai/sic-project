package com.softinter.sicapi.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class WorkPackageRequest {
    private UUID milestoneId;
    private String packageName;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String color;
    private String status;
}