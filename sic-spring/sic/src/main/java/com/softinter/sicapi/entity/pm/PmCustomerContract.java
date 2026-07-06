package com.softinter.sicapi.entity.pm;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pm_customer_contract")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class PmCustomerContract extends BaseBusinessEntity {

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", insertable = false, updatable = false)
    private PmCustomer customer;

    @Column(name = "contract_no", nullable = false, length = 50)
    private String contractNo;

    @Column(name = "contract_type", length = 50)
    private String contractType;

    @Column(name = "start_date")
    private Instant startDate;

    @Column(name = "end_date")
    private Instant endDate;

    @Column(name = "contract_value")
    private BigDecimal contractValue;

    @Column(name = "sign_status", length = 20)
    private String signStatus;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "payment_terms", length = 500)
    private String paymentTerms;

    @Column(name = "scope_summary", columnDefinition = "TEXT")
    private String scopeSummary;

    @Column(name = "renewal_status", length = 50)
    private String renewalStatus;

    @Transient
    private UUID projectId;

    @Transient
    private PmCustomerProject project;
}