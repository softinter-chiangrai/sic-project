package com.softinter.sicapi.dto.request;

import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
public class MilestoneRequest {
    private UUID phaseId;
    private String milestoneName;
    private String description;
    private Instant dueDate;
    private String color;
}