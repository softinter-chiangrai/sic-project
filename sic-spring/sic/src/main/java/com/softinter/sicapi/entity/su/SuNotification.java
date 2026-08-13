package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "su_notification",
       indexes = {
           @Index(name = "idx_notification_recipient", columnList = "business_id, recipient_user_id, is_read")
       })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuNotification extends BaseBusinessEntity {

    @Column(name = "recipient_user_id", nullable = false, length = 100)
    private String recipientUserId;

    @Column(name = "sender_id", length = 100)
    private String senderId;

    @Column(name = "sender_name", length = 100)
    private String senderName;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "message", nullable = false, length = 2000)
    private String message;

    @Column(name = "type", length = 50)
    private String type = "APPROVAL"; // APPROVAL, SYSTEM, CHAT

    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;
}
