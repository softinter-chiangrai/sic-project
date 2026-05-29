package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ChatMessageResponse {
    private UUID id;
    private String senderId;
    private String senderName;
    private String receiverId;
    private String receiverName;
    private String message;
    private String messageType;
    private UUID attachmentId;
    private boolean isRead;
    private LocalDateTime createdDate;
}
