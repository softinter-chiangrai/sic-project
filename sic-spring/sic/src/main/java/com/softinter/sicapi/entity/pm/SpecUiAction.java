package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "pm_spec_ui_action")
@Data
@EqualsAndHashCode(callSuper = true)
public class SpecUiAction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spec_id", nullable = false)
    private PmSpecification spec;

    @Column(name = "action_name", nullable = false, length = 100)
    private String actionName;

    @Column(name = "permission", length = 100)
    private String permission;

    @Column(name = "url_path", length = 255)
    private String urlPath;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;
}