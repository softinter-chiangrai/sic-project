package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PmCustomerContractResponse {
    private UUID id;
    private String contractNo;
    private String contractType;
    private UUID customerId;      // สำหรับแสดง (ถ้ามี)
    private String customerName;
    private UUID projectId;       // สำหรับแสดง (ถ้ามี)
    private String projectName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal contractValue;
    private String paymentTerms;
    private String scopeSummary;
    private String signStatus;
    private String renewalStatus;
    private Boolean isActive;
    private Integer rowVersion;
    private Instant createdDate;
}