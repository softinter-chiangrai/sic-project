package com.softinter.sicapi.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PhaseRequest {
    private UUID projectId;
    private String phaseCode;
    private String phaseName;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String color;
    private String owner;
    private UUID dependencyId; 
}