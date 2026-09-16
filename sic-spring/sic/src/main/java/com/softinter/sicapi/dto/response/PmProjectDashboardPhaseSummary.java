package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class PmProjectDashboardPhaseSummary {
    private UUID id;
    private String phaseCode;
    private String phaseName;
    private String status;
    private Integer progress;
    private LocalDate endDate;
}
