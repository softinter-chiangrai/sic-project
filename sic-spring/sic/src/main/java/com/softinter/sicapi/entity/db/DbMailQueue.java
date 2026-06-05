package com.softinter.sicapi.entity.db;

import com.softinter.sicapi.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "db_mail_queue")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class DbMailQueue extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private DbMailTemplate mailTemplate;

    @Column(name = "recipient_email", nullable = false, length = 255)
    private String recipientEmail;

    @Column(name = "recipient_name", length = 255)
    private String recipientName;

    @Column(name = "body_data", columnDefinition = "TEXT")
    private String bodyData;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "Pending";

    @Column(name = "retry_count")
    private Integer retryCount = 0;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(name = "scheduled_at")
    private Instant scheduledAt;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "next_retry_at")
    private Instant nextRetryAt;

    @Column(name = "used_config_id")
    private UUID usedConfigId;

    @Column(name = "use_english")
    private Boolean useEnglish = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "db_mail_config_id")  
    private DbMailConfig mailConfig;
}