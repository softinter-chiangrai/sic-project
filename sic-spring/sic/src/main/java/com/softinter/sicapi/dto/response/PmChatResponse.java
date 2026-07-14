package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class PmChatResponse {
    private UUID id;
    private UUID diagramId;
    private String role;
    private String content;
    private String contextData;
    private String createdBy;
    private Instant createdDate;
}