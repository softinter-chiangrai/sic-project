package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "pm_specification_business_rule")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmSpecificationBusinessRule extends BaseBusinessEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specification_id", nullable = false)
    private PmSpecification specification;

    @Column(name = "rule_name", nullable = false, length = 255)
    private String ruleName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 20)
    private String severity = "Medium";
}