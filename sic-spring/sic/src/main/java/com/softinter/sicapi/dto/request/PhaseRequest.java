package com.softinter.sicapi.dto.request;

import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
public class PhaseRequest {
    private UUID projectId;
    private String phaseName;
    private String description;
    private Instant startDate;
    private Instant endDate;
    private String color;
    private String owner;
    private UUID dependencyId; 
}