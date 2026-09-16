package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import com.softinter.sicapi.entity.enums.PaymentMethod;
import com.softinter.sicapi.entity.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "pm_payment")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmPayment extends BaseBusinessEntity {

    @Column(name = "payment_no", nullable = false, length = 50)
    private String paymentNo;

    @Column(name = "invoice_id", nullable = false)
    private UUID invoiceId;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod = PaymentMethod.BANK_TRANSFER;

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "reference_no", length = 100)
    private String referenceNo;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "receipt_file", columnDefinition = "TEXT")
    private String receiptFile;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus = PaymentStatus.PAID;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
