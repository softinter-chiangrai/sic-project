package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "pm_spec_validation_rule")
@Data
@EqualsAndHashCode(callSuper = true)
public class SpecValidationRule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spec_id", nullable = false)
    private PmSpecification spec;

    @Column(name = "field_name", nullable = false, length = 100)
    private String fieldName;

    @Column(name = "rule_type", nullable = false, length = 50)
    private String ruleType;

    @Column(name = "rule_value", length = 255)
    private String ruleValue;

    @Column(name = "error_message", length = 255)
    private String errorMessage;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;
}