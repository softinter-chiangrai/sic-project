package com.softinter.sicapi.dto.request;

import com.softinter.sicapi.entity.enums.ChatMessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {
    
    private String receiverId;

    private String message;
    
    @Builder.Default
    private ChatMessageType messageType = ChatMessageType.TEXT;

    private UUID attachmentId;
}
