package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class ChatGroupResponse {
    private UUID id;
    private String Name;
    private String groupDescription;
    private String createdByUserId;
    private List<ChatMemberResponse> members;
    private Instant createdDate;
}
