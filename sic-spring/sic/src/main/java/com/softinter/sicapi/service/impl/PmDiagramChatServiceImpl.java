package com.softinter.sicapi.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmChatRequest;
import com.softinter.sicapi.dto.response.PmChatResponse;
import com.softinter.sicapi.entity.pm.PmDiagramChat;
import com.softinter.sicapi.entity.pm.PmDiagramTab;
import com.softinter.sicapi.repository.pm.PmDiagramChatRepository;
import com.softinter.sicapi.repository.pm.PmDiagramTabRepository;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.PmAiProviderService;
import com.softinter.sicapi.service.PmDiagramChatService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PmDiagramChatServiceImpl implements PmDiagramChatService {

    private final PmDiagramChatRepository chatRepository;
    private final PmDiagramTabRepository tabRepository;
    private final PmAiProviderService aiProviderService;
    private final CurrentUserService currentUserService; 

    @Override
    @Transactional(readOnly = true)
    public List<PmChatResponse> getChatHistory(UUID diagramId) {
        return chatRepository.findByDiagramIdAndIsDeleteFalseOrderByCreatedDateAsc(diagramId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void clearChatHistory(UUID diagramId) {
        chatRepository.deleteByDiagramIdAndIsDeleteFalse(diagramId);
    }

    @Override
    @Transactional
    public PmChatResponse sendMessage(PmChatRequest request) {
        String userId = currentUserService.getUserId();
        UUID businessId = BusinessContextHolder.getBusinessId();

        PmDiagramTab tab = tabRepository.findById(request.getDiagramId())
                .orElseThrow(() -> new RuntimeException("Diagram not found"));

        // Save user message
        PmDiagramChat userChat = new PmDiagramChat();
        userChat.setBusinessId(businessId);
        userChat.setDiagram(tab);
        userChat.setUserId(userId);
        userChat.setRole("user");
        userChat.setContent(request.getMessage());
        PmDiagramChat savedUserChat = chatRepository.save(userChat);

        // Build context and get AI response
        String context = buildContext(tab, request);
        String aiResponse = aiProviderService.generateResponse(request.getMessage(), context);

        // Save AI message
        PmDiagramChat aiChat = new PmDiagramChat();
        aiChat.setBusinessId(businessId);
        aiChat.setDiagram(tab);
        aiChat.setUserId(userId);
        aiChat.setRole("assistant");
        aiChat.setContent(aiResponse);
        PmDiagramChat savedAiChat = chatRepository.save(aiChat);

        return toResponse(savedAiChat);
    }

    private String buildContext(PmDiagramTab tab, PmChatRequest request) {
        StringBuilder context = new StringBuilder();
        context.append("Current Diagram:\n");
        context.append("Name: ").append(tab.getName()).append("\n");
        context.append("Type: ").append(tab.getDiagramType()).append("\n");
        context.append("Script:\n").append(tab.getMermaidScript()).append("\n\n");

        List<PmDiagramChat> recent = chatRepository.findByDiagramIdAndIsDeleteFalseOrderByCreatedDateAsc(tab.getId());
        int start = Math.max(0, recent.size() - 5);
        if (start < recent.size()) {
            context.append("Recent Conversation:\n");
            for (int i = start; i < recent.size(); i++) {
                PmDiagramChat chat = recent.get(i);
                context.append(chat.getRole()).append(": ").append(chat.getContent()).append("\n");
            }
        }

        return context.toString();
    }

    private PmChatResponse toResponse(PmDiagramChat chat) {
        PmChatResponse dto = new PmChatResponse();
        dto.setId(chat.getId());
        dto.setDiagramId(chat.getDiagram().getId());
        dto.setRole(chat.getRole());
        dto.setContent(chat.getContent());
        dto.setContextData(chat.getContextData());
        dto.setCreatedBy(chat.getCreatedBy());
        dto.setCreatedDate(chat.getCreatedDate());
        return dto;
    }
}