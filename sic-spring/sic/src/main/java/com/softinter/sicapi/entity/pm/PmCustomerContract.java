package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

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
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "contract_value")
    private BigDecimal contractValue;

    @Column(name = "sign_status", length = 20)
    private String signStatus;

    @Column(name = "is_active")
    private Boolean isActive = true;
}