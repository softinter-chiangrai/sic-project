package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "pm_specification_validation")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmSpecificationValidation extends BaseBusinessEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specification_id", nullable = false)
    private PmSpecification specification;

    @Column(name = "validation_type", nullable = false, length = 50)
    private String validationType;

    @Column(name = "rule", nullable = false, columnDefinition = "TEXT")
    private String rule;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}