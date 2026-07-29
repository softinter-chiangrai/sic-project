package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "pm_specification_screen")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmSpecificationScreen extends BaseBusinessEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specification_id", nullable = false)
    private PmSpecification specification;

    @Column(name = "screen_name", nullable = false, length = 255)
    private String screenName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String navigation;

    @Column(name = "mockup_url", length = 500)
    private String mockupUrl;
}