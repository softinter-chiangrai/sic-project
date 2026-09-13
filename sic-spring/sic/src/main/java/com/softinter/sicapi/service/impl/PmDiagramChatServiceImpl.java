package com.softinter.sicapi.service.impl;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.PmChatRequest;
import com.softinter.sicapi.dto.response.PmChatResponse;
import com.softinter.sicapi.dto.response.PmDiagramChatSessionResponse;
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
    public List<PmDiagramChatSessionResponse> getSessions(UUID diagramId) {
        List<PmDiagramChat> allChats = chatRepository.findByDiagramIdAndIsDeleteFalseOrderByCreatedDateAsc(diagramId);
        if (allChats.isEmpty()) {
            return Collections.emptyList();
        }

        // Group chats by sessionId (or diagramId if null)
        Map<UUID, List<PmDiagramChat>> sessionMap = new LinkedHashMap<>();
        for (PmDiagramChat chat : allChats) {
            UUID sid = chat.getSessionId() != null ? chat.getSessionId() : diagramId;
            sessionMap.computeIfAbsent(sid, k -> new ArrayList<>()).add(chat);
        }

        List<PmDiagramChatSessionResponse> result = new ArrayList<>();
        for (Map.Entry<UUID, List<PmDiagramChat>> entry : sessionMap.entrySet()) {
            UUID sid = entry.getKey();
            List<PmDiagramChat> chats = entry.getValue();
            PmDiagramChat firstChat = chats.get(0);
            PmDiagramChat lastChat = chats.get(chats.size() - 1);

            String title = firstChat.getSessionTitle();
            if (title == null || title.isBlank()) {
                PmDiagramChat firstUserMsg = chats.stream()
                        .filter(c -> "user".equalsIgnoreCase(c.getRole()))
                        .findFirst()
                        .orElse(firstChat);
                String raw = firstUserMsg.getContent();
                title = raw.length() > 35 ? raw.substring(0, 35) + "..." : raw;
            }

            result.add(PmDiagramChatSessionResponse.builder()
                    .sessionId(sid)
                    .diagramId(diagramId)
                    .title(title)
                    .messageCount((long) chats.size())
                    .lastMessage(lastChat.getContent())
                    .createdAt(firstChat.getCreatedDate())
                    .updatedAt(lastChat.getCreatedDate())
                    .build());
        }

        // Sort latest sessions first
        result.sort((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()));
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PmChatResponse> getChatHistory(UUID diagramId) {
        return chatRepository.findByDiagramIdAndIsDeleteFalseOrderByCreatedDateAsc(diagramId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PmChatResponse> getChatHistoryBySession(UUID diagramId, UUID sessionId) {
        return chatRepository.findByDiagramIdAndSessionIdAndIsDeleteFalseOrderByCreatedDateAsc(diagramId, sessionId)
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
    public void deleteSession(UUID diagramId, UUID sessionId) {
        chatRepository.deleteByDiagramIdAndSessionId(diagramId, sessionId);
    }

    @Override
    @Transactional
    public void renameSession(UUID diagramId, UUID sessionId, String title) {
        chatRepository.updateSessionTitle(diagramId, sessionId, title);
    }

    @Override
    @Transactional
    public PmChatResponse sendMessage(PmChatRequest request) {
        String userId = currentUserService.getUserId();
        UUID businessId = BusinessContextHolder.getBusinessId();

        PmDiagramTab tab = tabRepository.findById(request.getDiagramId())
                .orElseThrow(() -> new RuntimeException("Diagram not found"));

        UUID sessionId = request.getSessionId() != null ? request.getSessionId() : UUID.randomUUID();
        String sessionTitle = request.getSessionTitle();
        if (sessionTitle == null || sessionTitle.isBlank()) {
            String raw = request.getMessage();
            sessionTitle = raw.length() > 35 ? raw.substring(0, 35) + "..." : raw;
        }

        // Save user message
        PmDiagramChat userChat = new PmDiagramChat();
        userChat.setBusinessId(businessId);
        userChat.setDiagram(tab);
        userChat.setUserId(userId);
        userChat.setSessionId(sessionId);
        userChat.setSessionTitle(sessionTitle);
        userChat.setRole("user");
        userChat.setContent(request.getMessage());
        chatRepository.save(userChat);

        // Build context and get AI response
        String context = buildContext(tab, sessionId, request);
        String aiResponse = aiProviderService.generateResponse(request.getMessage(), context, request.getModel());

        // Save AI message
        PmDiagramChat aiChat = new PmDiagramChat();
        aiChat.setBusinessId(businessId);
        aiChat.setDiagram(tab);
        aiChat.setUserId(userId);
        aiChat.setSessionId(sessionId);
        aiChat.setSessionTitle(sessionTitle);
        aiChat.setRole("assistant");
        aiChat.setContent(aiResponse);
        PmDiagramChat savedAiChat = chatRepository.save(aiChat);

        return toResponse(savedAiChat);
    }

    private String buildContext(PmDiagramTab tab, UUID sessionId, PmChatRequest request) {
        StringBuilder context = new StringBuilder();
        context.append("Current Diagram:\n");
        context.append("Name: ").append(tab.getName()).append("\n");
        context.append("Type: ").append(tab.getDiagramType()).append("\n");
        context.append("Script:\n").append(tab.getMermaidScript()).append("\n\n");

        List<PmDiagramChat> recent = chatRepository.findByDiagramIdAndSessionIdAndIsDeleteFalseOrderByCreatedDateAsc(tab.getId(), sessionId);
        int start = Math.max(0, recent.size() - 6);
        if (start < recent.size()) {
            context.append("Recent Conversation in this session:\n");
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
        dto.setSessionId(chat.getSessionId());
        dto.setSessionTitle(chat.getSessionTitle());
        dto.setRole(chat.getRole());
        dto.setContent(chat.getContent());
        dto.setContextData(chat.getContextData());
        dto.setCreatedBy(chat.getCreatedBy());
        dto.setCreatedDate(chat.getCreatedDate());
        return dto;
    }
}