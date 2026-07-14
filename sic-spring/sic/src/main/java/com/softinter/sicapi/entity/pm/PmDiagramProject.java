package com.softinter.sicapi.entity.pm;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.softinter.sicapi.entity.base.BaseEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "pm_diagram_projects")
public class PmDiagramProject extends BaseEntity {

    @Column(name = "business_id")
    private UUID businessId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_favorite")
    private Boolean isFavorite = false;

    @Column(name = "last_opened")
    private Instant lastOpened;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PmDiagramTab> tabs = new ArrayList<>();
}