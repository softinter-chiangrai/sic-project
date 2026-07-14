package com.softinter.sicapi.entity.pm;

import java.util.UUID;

import com.softinter.sicapi.entity.base.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "pm_diagram_versions")
public class PmDiagramVersion extends BaseEntity {

    @Column(name = "business_id")
    private UUID businessId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagram_id", nullable = false)
    private PmDiagramTab diagram;

    @Column(name = "mermaid_script", nullable = false, columnDefinition = "TEXT")
    private String mermaidScript;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "change_comment", columnDefinition = "TEXT")
    private String changeComment;
}