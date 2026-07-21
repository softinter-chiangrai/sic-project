// src/main/java/com/softinter/sicapi/entity/pm/PmRequirementChangeRequest.java
package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "pm_requirement_change_request")
public class PmRequirementChangeRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requirement_id", nullable = false)
    private PmRequirement requirement;

    @Column(name = "change_description", columnDefinition = "TEXT")
    private String changeDescription;

    @Column(name = "impact_summary", columnDefinition = "TEXT")
    private String impactSummary;

    @Column(name = "estimated_manday")
    private Integer estimatedManday;

    @Column(name = "status", length = 20)
    private String status = "Draft";
}