package com.softinter.sicapi.dto.request;

import java.time.Instant;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PmCustomerProjectRequest {

    @NotNull(message = "Customer ID is required")
    private UUID customerId;

    // ✅ เพิ่ม contractId
    private UUID contractId;

    @NotBlank(message = "Project code is required")
    @Size(max = 30)
    private String projectCode;

    @NotBlank(message = "Project name is required")
    @Size(max = 255)
    private String projectName;

    private Instant startDate;
    private Instant plannedEndDate;
    private Instant actualEndDate;

    private Integer budgetManday;
    private Integer usedManday;

    @Size(max = 50)
    private String status;

    @Size(max = 20)
    private String priority;

    @Size(max = 2000)
    private String description;

    private Boolean isActive;

    private Integer rowVersion;
}