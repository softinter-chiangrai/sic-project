package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PmChatRequest;
import com.softinter.sicapi.dto.response.PmChatResponse;

import java.util.List;
import java.util.UUID;

public interface PmDiagramChatService {

    List<PmChatResponse> getChatHistory(UUID diagramId);

    void clearChatHistory(UUID diagramId);

    PmChatResponse sendMessage(PmChatRequest request);
}