// File: sic-spring/sic/src/main/java/com/softinter/sicapi/entity/pm/PmDiagramTab.java
package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "pm_diagram")
public class PmDiagramTab extends BaseEntity {

    @Column(name = "business_id")
    private UUID businessId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private PmDiagramProject project;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "diagram_type", nullable = false, length = 50)
    private String diagramType;

    @Column(name = "mermaid_script", columnDefinition = "TEXT")
    private String mermaidScript;

    // เปลี่ยนจาก String เป็น Map เพื่อให้ Hibernate จัดการ JSONB โดยตรง
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private Map<String, Object> metadata;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @OneToMany(mappedBy = "diagram", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PmDiagramVersion> versions = new ArrayList<>();

    @OneToMany(mappedBy = "diagram", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PmDiagramChat> chatMessages = new ArrayList<>();
}