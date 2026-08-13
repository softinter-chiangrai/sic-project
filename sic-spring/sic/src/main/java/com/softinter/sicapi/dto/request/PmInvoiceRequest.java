package com.softinter.sicapi.dto.request;

import com.softinter.sicapi.entity.enums.BillingType;
import com.softinter.sicapi.entity.enums.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PmInvoiceRequest {
    private UUID id;

    private String invoiceNo;

    @NotNull(message = "Customer ID is required")
    private UUID customerId;

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    private UUID contractId;
    private UUID deliveryId;
    private UUID milestoneId;

    private BillingType billingType = BillingType.MILESTONE;

    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @NotNull(message = "Subtotal amount is required")
    private BigDecimal subtotalAmount;

    private BigDecimal vatRate = new BigDecimal("7.00");
    private BigDecimal vatAmount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;
    private String approvalStatus = "DRAFT";
    private String receiptFileRef;
    private String remark;

    private Integer state;
    private Integer rowVersion;
}
