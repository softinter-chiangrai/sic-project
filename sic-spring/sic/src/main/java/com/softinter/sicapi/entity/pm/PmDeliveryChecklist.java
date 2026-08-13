package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pm_delivery_checklist")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmDeliveryChecklist extends BaseEntity {

    @Column(name = "delivery_id", nullable = false)
    private UUID deliveryId;

    @Column(name = "item_name", nullable = false, length = 255)
    private String itemName;

    @Column(name = "item_category", length = 50)
    private String itemCategory; // REQUIREMENT, SPEC, TEST, BUG, MANUAL, UAT

    @Column(name = "is_checked", nullable = false)
    private Boolean isChecked = false;

    @Column(name = "checked_by", length = 255)
    private String checkedBy;

    @Column(name = "checked_date")
    private Instant checkedDate;

    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;
}
