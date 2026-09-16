package com.softinter.sicapi.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class MilestoneRequest {
    private UUID phaseId;
    private String milestoneName;
    private String description;
    private LocalDate dueDate;
    private String color;
    private String status;
}