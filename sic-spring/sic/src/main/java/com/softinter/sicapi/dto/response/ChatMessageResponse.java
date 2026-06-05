package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

import com.softinter.sicapi.entity.enums.ChatMessageType;

@Data
public class ChatMessageResponse {
    private UUID id;
    private String senderId;
    private String senderName;
    private String receiverId;
    private String receiverName;
    private String message;
    private ChatMessageType messageType;
    private UUID attachmentId;
    private boolean isRead;
    private Instant createdDate;
}
