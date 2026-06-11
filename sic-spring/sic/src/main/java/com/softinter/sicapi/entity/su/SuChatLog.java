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
@Table(name = "su_chat_log",
       indexes = {
           @Index(name = "idx_business_sender_receiver", columnList = "business_id, sender_id, receiver_id")
       })
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SuChatLog extends BaseBusinessEntity {

    @Column(name = "sender_id", nullable = false, length = 100)
    private String senderId;

    @Column(name = "receiver_id", nullable = false, length = 100)
    private String receiverId;

    @Column(name = "sender_name", length = 100) 
    private String senderName;

    @Column(name = "receiver_name", length = 100)  
    private String receiverName;

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

    @Column(name = "call_accepted")
    private Boolean callAccepted;

    @Column(name = "call_duration_seconds")
    private Integer callDurationSeconds;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attachment_id")
    private SuUpload attachment;

    @Column(name = "is_read")
    private Boolean isRead;  
    
    @Column(name = "is_deleted")  
    private Boolean isDeleted;  
}