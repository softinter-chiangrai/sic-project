package com.softinter.sicapi.entity.pm;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;

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
@Table(name = "pm_work_package")
@Getter @Setter
public class PmWorkPackage extends BaseBusinessEntity  {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milestone_id", nullable = false)
    private PmMilestone milestone;

    @Column(name = "package_name", nullable = false, length = 255)
    private String packageName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date")
    private Instant startDate;

    @Column(name = "end_date")
    private Instant endDate;

    @Column(name = "color", length = 20)
    private String color;

    @Column(length = 20)
    private String status;

    @OneToMany(mappedBy = "workPackage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PmTask> tasks = new ArrayList<>();
}
