package com.softinter.sicapi.websocket;

import com.softinter.sicapi.dto.request.ChatMessageRequest;
import com.softinter.sicapi.dto.response.ChatMessageResponse;
import com.softinter.sicapi.entity.su.SuChatLog;
import com.softinter.sicapi.repository.su.SuChatLogRepository;
import com.softinter.sicapi.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final SuChatLogRepository chatLogRepository;
    private final CurrentUserService currentUserService;

    @MessageMapping("/chat/private")
    public void sendPrivateMessage(@Payload ChatMessageRequest request) {
        String currentUserId = currentUserService.getUserId();
        String currentUsername = currentUserService.getUsername();

        SuChatLog chatLog = new SuChatLog();
        chatLog.setSenderId(currentUserId);
        chatLog.setSenderName(currentUsername);
        chatLog.setReceiverId(request.getReceiverId());
        chatLog.setMessage(request.getMessage());
        chatLog.setMessageType(request.getMessageType());
        chatLog.setIsRead(false);
        chatLog.setIsActive(true);
        chatLogRepository.save(chatLog);

        ChatMessageResponse response = new ChatMessageResponse();
        response.setId(chatLog.getId());
        response.setSenderId(currentUserId);
        response.setSenderName(currentUsername);
        response.setReceiverId(request.getReceiverId());
        response.setMessage(request.getMessage());
        response.setMessageType(request.getMessageType());
        response.setRead(false);
        response.setCreatedDate(chatLog.getCreatedDate());

        messagingTemplate.convertAndSendToUser(request.getReceiverId(), "/queue/messages", response);
    }
}
