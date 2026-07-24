package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.enums.TraceRelationship;
import com.softinter.sicapi.entity.base.BaseEntity;
import com.softinter.sicapi.entity.enums.TraceRelationship;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "pm_trace_link")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmTraceLink extends BaseEntity {

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "source_type", nullable = false, length = 50)
    private String sourceType;

    @Column(name = "source_id", nullable = false)
    private UUID sourceId;

    @Column(name = "target_type", nullable = false, length = 50)
    private String targetType;

    @Column(name = "target_id", nullable = false)
    private UUID targetId;
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "relationship_type", nullable = false)
    private TraceRelationship relationshipType;
}