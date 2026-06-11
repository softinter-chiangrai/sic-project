package com.softinter.sicapi.entity.su;

import com.softinter.sicapi.entity.base.BaseBusinessEntity;
import com.softinter.sicapi.entity.enums.ChatMessageType;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "su_chat_group_log")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuChatGroupLog extends BaseBusinessEntity {

    @Column(name = "group_id", insertable = false, updatable = false)
    private UUID groupId;

    @Column(name = "sender_id", nullable = false, length = 100)
    private String senderId;

    @Column(name = "sender_name", length = 100)  
    private String senderName;

    @Column(name = "message", nullable = false, length = 4000)
    private String message = "";

   
    @Column(name = "message_type", nullable = false)
    private ChatMessageType messageType = ChatMessageType.TEXT;

    @Column(name = "attachment_id", insertable = false, updatable = false)
    private UUID attachmentId;

    @Column(name = "is_cancelled", nullable = false)
    private Boolean isCancelled = false;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "cancelled_by", length = 100)
    private String cancelledBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private SuChatGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attachment_id")
    private SuUpload attachment;

}