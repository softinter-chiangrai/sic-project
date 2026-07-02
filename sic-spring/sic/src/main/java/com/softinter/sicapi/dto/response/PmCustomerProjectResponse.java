package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PmCustomerProjectResponse {
    private UUID id;
    private UUID customerId;
    private String customerName;
    private UUID businessId;

    // ✅ เพิ่ม contractId และ contractNo
    private UUID contractId;
    private String contractNo;

    private String projectCode;
    private String projectName;
    private LocalDate startDate;
    private LocalDate plannedEndDate;
    private LocalDate actualEndDate;
    private Integer budgetManday;
    private Integer usedManday;
    private String status;
    private String priority;
    private String description;
    private Boolean isActive;
    private Instant createdDate;
    private Instant updatedDate;
    private Integer rowVersion;
}