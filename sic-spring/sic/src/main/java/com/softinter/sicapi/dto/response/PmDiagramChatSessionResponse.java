package com.softinter.sicapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PmDiagramChatSessionResponse {
    private UUID sessionId;
    private UUID diagramId;
    private String title;
    private Long messageCount;
    private String lastMessage;
    private Instant createdAt;
    private Instant updatedAt;
}
