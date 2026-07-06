package com.softinter.sicapi.entity.pm;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.softinter.sicapi.entity.base.BaseEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "pm_phase")
@Getter @Setter
public class PmPhase extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private PmCustomerProject project;

    @Column(name = "phase_name", nullable = false, length = 255)
    private String phaseName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date")
    private Instant startDate;

    @Column(name = "end_date")
    private Instant endDate;

    @Column(length = 100)
    private String owner;

    @Column(length = 20)
    private String status; // Not Started, In Progress, Done, Delayed

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dependency")
    private PmPhase dependency;

    @Column
    private Integer progress;

    @OneToMany(mappedBy = "phase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PmMilestone> milestones = new ArrayList<>();
}
