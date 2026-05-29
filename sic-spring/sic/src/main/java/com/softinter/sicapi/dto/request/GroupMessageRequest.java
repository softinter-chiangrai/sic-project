package com.softinter.sicapi.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class GroupMessageRequest {
    private UUID groupId;
    private String message;
    private String messageType = "text";
}
