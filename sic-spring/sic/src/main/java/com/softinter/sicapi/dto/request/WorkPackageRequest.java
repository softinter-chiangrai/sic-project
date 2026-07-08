package com.softinter.sicapi.dto.request;

import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
public class WorkPackageRequest {
    private UUID milestoneId;
    private String packageName;
    private String description;
    private Instant startDate;
    private Instant endDate;
    private String color;
}