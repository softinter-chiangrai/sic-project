package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class NotificationResponse {
    private UUID id;
    private String recipientUserId;
    private String senderId;
    private String senderName;
    private String title;
    private String message;
    private String type;
    private String linkUrl;
    private boolean isRead;
    private Instant createdDate;
}
