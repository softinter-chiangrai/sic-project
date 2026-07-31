package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@Entity
@Table(name = "pm_change_impact")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmChangeImpact extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "change_request_id", nullable = false)
    private PmChangeRequest changeRequest;

    @Column(name = "impacted_type", nullable = false, length = 50)
    private String impactedType;

    @Column(name = "impacted_id", nullable = false)
    private UUID impactedId;

    @Column(name = "impacted_title", length = 255)
    private String impactedTitle;

    @Column(name = "impact_level", length = 20)
    private String impactLevel = "MEDIUM"; // LOW, MEDIUM, HIGH
}
