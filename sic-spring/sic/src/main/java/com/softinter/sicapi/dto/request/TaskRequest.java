package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

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

    // ===== เพิ่มสำหรับ Traceability =====
    private UUID specificationId;   // เชื่อมกับ Specification
}