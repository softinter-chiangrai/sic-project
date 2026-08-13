package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pm_specification")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmSpecification extends BaseBusinessEntity {

    @Column(name = "specification_code", nullable = false, unique = true, length = 50)
    private String specificationCode;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "module", length = 100)
    private String module;

    @Column(name = "version", length = 20)
    private String version = "1.0";

    @Column(name = "status", length = 20)
    private String status = "Draft";

    @Column(name = "priority", length = 20)
    private String priority = "Medium";

    @Column(name = "owner", length = 100)
    private String owner;

    @Column(name = "estimated_manday")
    private Integer estimatedManday;

    @Column(columnDefinition = "TEXT")
    private String description;  

    @Column(name = "upload_group_id")
    private UUID uploadGroupId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private PmCustomerProject project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requirement_id")
    private PmRequirement requirement;

    @Column(name = "is_ai_generated")
    private Boolean isAiGenerated = false;

    @Column(name = "ai_generated_at")
    private Instant aiGeneratedAt;

    @Column(name = "generated_from_requirement_id")
    private UUID generatedFromRequirementId;

    @Column(name = "generated_from_diagram_id")
    private UUID generatedFromDiagramId;

    @Column(name = "is_active")
    private Boolean isActive = true;
}