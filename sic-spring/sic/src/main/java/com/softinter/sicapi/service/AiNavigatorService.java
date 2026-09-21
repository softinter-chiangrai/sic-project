package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.AiNavigatorChatRequest;
import com.softinter.sicapi.dto.response.AiNavigatorChatResponse;

public interface AiNavigatorService {
    AiNavigatorChatResponse chat(AiNavigatorChatRequest request);
}
