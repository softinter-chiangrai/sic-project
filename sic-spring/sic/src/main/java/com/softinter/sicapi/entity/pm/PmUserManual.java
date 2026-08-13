package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@Entity
@Table(name = "pm_user_manual")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmUserManual extends BaseBusinessEntity {

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "manual_code", nullable = false, length = 50)
    private String manualCode;

    @Column(name = "manual_title", nullable = false, length = 255)
    private String manualTitle;

    @Column(name = "manual_type", length = 50)
    private String manualType = "USER"; // USER, ADMIN, INSTALLATION, OPERATION, TROUBLESHOOT

    @Column(name = "version", length = 20)
    private String version = "1.0";

    @Column(name = "related_spec_id")
    private UUID relatedSpecId;

    @Column(name = "delivery_id")
    private UUID deliveryId;

    @Column(name = "status", length = 30)
    private String status = "DRAFT"; // DRAFT, REVIEW, APPROVED, PUBLISHED

    @Column(name = "attachment_group_id")
    private UUID attachmentGroupId;
}
