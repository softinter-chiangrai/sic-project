package com.softinter.sicapi.dto.response;

import com.softinter.sicapi.entity.enums.BillingType;
import com.softinter.sicapi.entity.enums.PaymentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PmInvoiceResponse {
    private UUID id;
    private UUID businessId;
    private String invoiceNo;
    private UUID customerId;
    private String customerName;
    private UUID projectId;
    private String projectName;
    private UUID contractId;
    private String contractNo;
    private UUID deliveryId;
    private UUID milestoneId;
    private String milestoneTitle;
    private BillingType billingType;
    private Instant issueDate;
    private Instant dueDate;
    private BigDecimal subtotalAmount;
    private BigDecimal vatRate;
    private BigDecimal vatAmount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private PaymentStatus paymentStatus;
    private String approvalStatus;
    private String receiptFileRef;
    private String remark;

    private String createdBy;
    private Instant createdDate;
    private String updatedBy;
    private Instant updatedDate;
    private Integer rowVersion;
}
