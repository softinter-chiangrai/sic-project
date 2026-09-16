package com.softinter.sicapi.dto.response;

import com.softinter.sicapi.entity.enums.PaymentMethod;
import com.softinter.sicapi.entity.enums.PaymentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PmPaymentResponse {
    private UUID id;
    private UUID businessId;
    private String paymentNo;
    private UUID invoiceId;
    private String invoiceNo;
    private UUID customerId;
    private String customerName;
    private UUID projectId;
    private String projectName;
    private LocalDate paymentDate;
    private PaymentMethod paymentMethod;
    private BigDecimal amount;
    private String referenceNo;
    private String bankName;
    private String receiptFile;
    private PaymentStatus paymentStatus;
    private String notes;

    private String createdBy;
    private Instant createdDate;
    private String updatedBy;
    private Instant updatedDate;
    private Integer rowVersion;
}
