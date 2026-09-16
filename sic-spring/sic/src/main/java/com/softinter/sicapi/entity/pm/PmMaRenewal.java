package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import com.softinter.sicapi.entity.enums.MaRenewalStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "pm_ma_renewal")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmMaRenewal extends BaseBusinessEntity {

    @Column(name = "renewal_no", nullable = false, length = 50)
    private String renewalNo;

    @Column(name = "contract_id", nullable = false)
    private UUID contractId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "current_end_date", nullable = false)
    private LocalDate currentEndDate;

    @Column(name = "new_start_date", nullable = false)
    private LocalDate newStartDate;

    @Column(name = "new_end_date", nullable = false)
    private LocalDate newEndDate;

    @Column(name = "proposed_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal proposedAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private MaRenewalStatus status = MaRenewalStatus.DRAFT;

    @Column(name = "new_contract_id")
    private UUID newContractId;

    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;
}
