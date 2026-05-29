package com.softinter.sicapi.dto.request;

import lombok.Data;

@Data
public class ChatMessageRequest {
    private String receiverId;
    private String message;
    private String messageType = "text";
}
