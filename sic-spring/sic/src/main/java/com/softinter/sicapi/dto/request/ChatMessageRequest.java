package com.softinter.sicapi.dto.request;

import com.softinter.sicapi.entity.enums.ChatMessageType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatMessageRequest {
    
    private String receiverId;

    private String message;
    
    @Builder.Default
    private ChatMessageType messageType = ChatMessageType.TEXT;
}
