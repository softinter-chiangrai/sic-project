package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

import com.softinter.sicapi.entity.enums.ChatMessageType;

@Data
public class ChatGroupMessageResponse {
    private UUID id;
    private UUID groupId;
    private String senderId;
    private String senderName;
    private String message;
    private ChatMessageType messageType;
    private UUID attachmentId;
    private Instant createdDate;
}
