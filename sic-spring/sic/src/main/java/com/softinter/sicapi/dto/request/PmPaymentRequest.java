package com.softinter.sicapi.dto.request;

import com.softinter.sicapi.entity.enums.PaymentMethod;
import com.softinter.sicapi.entity.enums.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PmPaymentRequest {
    private UUID id;

    private String paymentNo;

    @NotNull(message = "Invoice ID is required")
    private UUID invoiceId;

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    private PaymentMethod paymentMethod = PaymentMethod.BANK_TRANSFER;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private String referenceNo;
    private String bankName;
    private String receiptFile;
    private PaymentStatus paymentStatus = PaymentStatus.PAID;
    private String notes;

    private Integer state;
    private Integer rowVersion;
}
