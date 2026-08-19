package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@Entity
@Table(name = "pm_delivery_item")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmDeliveryItem extends BaseEntity {

    @Column(name = "delivery_id", nullable = false)
    private UUID deliveryId;

    @Column(name = "item_type", nullable = false, length = 50)
    private String itemType; // REQUIREMENT, TEST_CASE, USER_MANUAL, CHANGE_REQUEST, SPECIFICATION, DIAGRAM

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(name = "item_code", length = 50)
    private String itemCode;

    @Column(name = "item_title", length = 255)
    private String itemTitle;

    @Column(name = "item_status", length = 50)
    private String itemStatus;

    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;
}
