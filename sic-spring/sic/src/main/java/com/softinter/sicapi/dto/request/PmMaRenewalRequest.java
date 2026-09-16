package com.softinter.sicapi.dto.request;

import com.softinter.sicapi.entity.enums.MaRenewalStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PmMaRenewalRequest {
    private UUID id;

    private String renewalNo;

    @NotNull(message = "Contract ID is required")
    private UUID contractId;

    @NotNull(message = "Customer ID is required")
    private UUID customerId;

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotNull(message = "Current end date is required")
    private LocalDate currentEndDate;

    @NotNull(message = "New start date is required")
    private LocalDate newStartDate;

    @NotNull(message = "New end date is required")
    private LocalDate newEndDate;

    @NotNull(message = "Proposed amount is required")
    private BigDecimal proposedAmount;

    private MaRenewalStatus status = MaRenewalStatus.DRAFT;
    private UUID newContractId;
    private String remark;

    private Integer state;
    private Integer rowVersion;
}
