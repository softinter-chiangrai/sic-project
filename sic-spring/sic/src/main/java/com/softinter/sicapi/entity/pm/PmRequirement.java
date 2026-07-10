package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@Entity
@Table(name = "pm_requirement")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmRequirement extends BaseBusinessEntity {

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", insertable = false, updatable = false)
    private PmCustomerProject project;

    @Column(name = "requirement_code", nullable = false, length = 30)
    private String requirementCode;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "requirement_type", length = 50)
    private String requirementType;

    @Column(name = "source", length = 100)
    private String source;

    @Column(name = "priority", length = 20)
    private String priority;

    @Column(name = "business_value", length = 255)
    private String businessValue;

    @Column(name = "acceptance_criteria", columnDefinition = "TEXT")
    private String acceptanceCriteria;

    @Column(name = "version", length = 10)
    private String version;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "is_active")
    private Boolean isActive = true;
}