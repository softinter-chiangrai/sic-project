package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PmChatRequest;
import com.softinter.sicapi.dto.response.PmChatResponse;
import com.softinter.sicapi.dto.response.PmDiagramChatSessionResponse;

import java.util.List;
import java.util.UUID;

public interface PmDiagramChatService {

    List<PmDiagramChatSessionResponse> getSessions(UUID diagramId);

    List<PmChatResponse> getChatHistory(UUID diagramId);

    List<PmChatResponse> getChatHistoryBySession(UUID diagramId, UUID sessionId);

    void clearChatHistory(UUID diagramId);

    void deleteSession(UUID diagramId, UUID sessionId);

    void renameSession(UUID diagramId, UUID sessionId, String title);

    PmChatResponse sendMessage(PmChatRequest request);
}