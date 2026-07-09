package com.softinter.sicapi.entity.pm;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pm_approval_reminder")
@Data
@EqualsAndHashCode(callSuper = true)
public class PmApprovalReminder extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approval_id", nullable = false)
    private PmApproval approval;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_status_id")
    private PmApprovalStepStatus stepStatus;

    @Column(name = "reminder_type", length = 20)
    private String reminderType = "AUTO";

    @Column(name = "sent_at")
    private Instant sentAt = Instant.now();

    @Column(name = "recipient", length = 100)
    private String recipient;

    @Column(name = "recipient_email", length = 320)
    private String recipientEmail;

    @Column(name = "channel", length = 20)
    private String channel;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read")
    private Boolean isRead = false;
}