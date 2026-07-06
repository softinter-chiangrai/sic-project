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
@Table(name = "pm_milestone")
@Getter @Setter
public class PmMilestone extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phase_id", nullable = false)
    private PmPhase phase;

    @Column(name = "milestone_name", nullable = false, length = 255)
    private String milestoneName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "due_date")
    private Instant dueDate;

    @Column(length = 20)
    private String status;

    @OneToMany(mappedBy = "milestone", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PmWorkPackage> workPackages = new ArrayList<>();
}
