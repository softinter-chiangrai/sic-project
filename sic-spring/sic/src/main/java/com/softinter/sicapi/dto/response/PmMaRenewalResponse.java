package com.softinter.sicapi.dto.response;

import com.softinter.sicapi.entity.enums.MaRenewalStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PmMaRenewalResponse {
    private UUID id;
    private UUID businessId;
    private String renewalNo;
    private UUID contractId;
    private String contractNo;
    private UUID customerId;
    private String customerName;
    private UUID projectId;
    private String projectName;
    private Instant currentEndDate;
    private Instant newStartDate;
    private Instant newEndDate;
    private BigDecimal proposedAmount;
    private MaRenewalStatus status;
    private Boolean isLocked;
    private UUID newContractId;
    private String remark;

    private String createdBy;
    private Instant createdDate;
    private String updatedBy;
    private Instant updatedDate;
    private Integer rowVersion;
}
