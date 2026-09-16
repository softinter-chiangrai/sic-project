package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "pm_delivery")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmDelivery extends BaseBusinessEntity {

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "delivery_code", nullable = false, length = 50)
    private String deliveryCode;

    @Column(name = "delivery_title", nullable = false, length = 255)
    private String deliveryTitle;

    @Column(name = "delivery_type", length = 50)
    private String deliveryType = "FINAL"; // FINAL, PARTIAL, MILESTONE

    @Column(name = "contract_id")
    private UUID contractId;

    @Column(name = "milestone_id")
    private UUID milestoneId;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(name = "delivery_version", length = 20)
    private String deliveryVersion = "1.0";

    @Column(name = "release_note", columnDefinition = "TEXT")
    private String releaseNote;

    @Column(name = "delivery_summary", columnDefinition = "TEXT")
    private String deliverySummary;

    @Column(name = "status", length = 30)
    private String status = "DRAFT"; // DRAFT, PREPARING, READY, DELIVERED, CONFIRMED

    @Column(name = "pm_approved_by", length = 255)
    private String pmApprovedBy;

    @Column(name = "pm_approved_date")
    private Instant pmApprovedDate;

    @Column(name = "customer_signed_by", length = 255)
    private String customerSignedBy;

    @Column(name = "customer_signed_date")
    private Instant customerSignedDate;

    @Column(name = "attachment_group_id")
    private UUID attachmentGroupId;

    @Column(name = "is_locked")
    private Boolean isLocked = false;
}
