package com.softinter.sicapi.entity.pm;

import java.time.Instant;
import java.util.UUID;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import com.softinter.sicapi.entity.su.SuBusiness;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pm_customer_project")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class PmCustomerProject extends BaseBusinessEntity {

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", insertable = false, updatable = false)
    private PmCustomer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", insertable = false, updatable = false)
    private SuBusiness business;

    // ✅ เพิ่ม contractId
    @Column(name = "contract_id")
    private UUID contractId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", insertable = false, updatable = false)
    private PmCustomerContract contract;

    @Column(name = "project_code", nullable = false, length = 30)
    private String projectCode;

    @Column(name = "project_name", nullable = false, length = 255)
    private String projectName;

    @Column(name = "start_date")
    private Instant startDate;

    @Column(name = "planned_end_date")
    private Instant plannedEndDate;

    @Column(name = "actual_end_date")
    private Instant actualEndDate;

    @Column(name = "budget_manday")
    private Integer budgetManday;

    @Column(name = "used_manday")
    private Integer usedManday = 0;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "priority", length = 20)
    private String priority;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active")
    private Boolean isActive = true;
}