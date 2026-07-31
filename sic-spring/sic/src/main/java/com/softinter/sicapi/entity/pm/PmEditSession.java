package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pm_edit_session")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmEditSession extends BaseEntity {
    @Column(name = "change_request_id", nullable = false)
    private UUID changeRequestId;

    @Column(name = "target_type", nullable = false, length = 50)
    private String targetType;

    @Column(name = "target_id", nullable = false)
    private UUID targetId;

    @Column(name = "assignee_id", nullable = false, length = 100)
    private String assigneeId;

    @Column(name = "granted_at", nullable = false)
    private Instant grantedAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "edit_type", nullable = false, length = 20)
    private String editType = "CHANGE_REQUEST"; 
}