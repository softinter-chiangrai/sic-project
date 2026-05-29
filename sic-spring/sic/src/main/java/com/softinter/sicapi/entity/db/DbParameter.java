package com.softinter.sicapi.entity.db;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "db_parameter",
       indexes = {
           @Index(name = "idx_module_param_value", columnList = "module_code, parameter_code, parameter_value", unique = true)
       })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class DbParameter extends BaseEntity {

    @Column(name = "module_code", nullable = false, length = 50)
    private String moduleCode;

    @Column(name = "parameter_code", nullable = false, length = 50)
    private String parameterCode;

    @Column(name = "parameter_value", nullable = false, length = 50)
    private String parameterValue;

    @Column(name = "parameter_name_en", nullable = false, length = 100)
    private String parameterNameEn;

    @Column(name = "parameter_name_local", nullable = false, length = 100)
    private String parameterNameLocal;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = false;

    @Column(name = "sort_order")
    private Integer sortOrder;
}