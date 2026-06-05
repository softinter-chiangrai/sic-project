package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.UUID;

import com.softinter.sicapi.entity.enums.ChatMessageType;

@Data
public class GroupMessageRequest {
    private UUID groupId;
    private String message;
    private ChatMessageType messageType = ChatMessageType.TEXT;
}
