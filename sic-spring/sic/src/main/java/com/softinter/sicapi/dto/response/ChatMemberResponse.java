package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class ChatMemberResponse {
    private UUID id;
    private UUID groupId;
    private String userId;
    private String userName;
    private String role;
    private Instant joinedAt;
}
