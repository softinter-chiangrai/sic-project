package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@Entity
@Table(name = "pm_test_scenario")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmTestScenario extends BaseBusinessEntity {

    @Column(name = "test_plan_id", nullable = false)
    private UUID testPlanId;

    @Column(name = "scenario_name", nullable = false, length = 255)
    private String scenarioName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "prerequisite", columnDefinition = "TEXT")
    private String prerequisite;
}