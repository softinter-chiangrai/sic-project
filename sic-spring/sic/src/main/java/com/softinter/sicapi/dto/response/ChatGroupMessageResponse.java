package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ChatGroupMessageResponse {
    private UUID id;
    private UUID groupId;
    private String senderId;
    private String senderName;
    private String message;
    private String messageType;
    private UUID attachmentId;
    private LocalDateTime createdDate;
}
