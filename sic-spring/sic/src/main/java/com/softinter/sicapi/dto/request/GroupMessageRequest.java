package com.softinter.sicapi.dto.request;

import com.softinter.sicapi.entity.enums.ChatMessageType;
import lombok.Data;

import java.util.UUID;

@Data
public class GroupMessageRequest {
    private UUID groupId;
    private String message;
    private ChatMessageType messageType = ChatMessageType.TEXT;
    private UUID attachmentId;
}
