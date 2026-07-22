package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "pm_specification")
public class PmSpecification extends BaseEntity {

    // ===== Business ID (จาก BaseBusinessEntity แต่ BaseEntity ไม่มี) =====
    // ถ้าใช้ BaseBusinessEntity ให้ extends BaseBusinessEntity
    // ถ้าใช้ BaseEntity ให้เพิ่ม field นี้
    @Column(name = "business_id")
    private UUID businessId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private PmCustomerProject project;

    // ✅ เพิ่ม FK ไปยัง Requirement
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requirement_id")
    private PmRequirement requirement;

    @Column(name = "project_id", insertable = false, updatable = false)
    private UUID projectId;  // ✅ เพิ่ม getter ให้ใช้ใน Service

    @Column(name = "spec_code", nullable = false, length = 30)
    private String specCode;

    @Column(name = "spec_type", nullable = false, length = 50)
    private String specType;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "related_requirement", columnDefinition = "TEXT")
    private String relatedRequirement;

    @Column(name = "related_er", columnDefinition = "TEXT")
    private String relatedEr;

    @Column(name = "ui_action", columnDefinition = "TEXT")
    private String uiAction;

    @Column(name = "validation_rule", columnDefinition = "TEXT")
    private String validationRule;

    @Column(name = "permission", columnDefinition = "TEXT")
    private String permission;

    @Column(name = "estimated_manday")
    private Integer estimatedManday;

    @Column(name = "dependency", columnDefinition = "TEXT")
    private String dependency;

    @Column(name = "status", length = 20)
    private String status = "Draft";

    // ===== Helper Methods =====
    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public UUID getBusinessId() {
        return businessId;
    }

    public void setBusinessId(UUID businessId) {
        this.businessId = businessId;
    }
}