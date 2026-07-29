package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "pm_specification_field")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmSpecificationField extends BaseBusinessEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specification_id", nullable = false)
    private PmSpecification specification;

    @Column(name = "field_name", nullable = false, length = 100)
    private String fieldName;

    @Column(name = "data_type", nullable = false, length = 50)
    private String dataType;

    @Column(name = "is_required")
    private Boolean isRequired = false;

    @Column(name = "max_length")
    private Integer maxLength;

    @Column(name = "default_value", length = 255)
    private String defaultValue;

    @Column(columnDefinition = "TEXT")
    private String description;
}