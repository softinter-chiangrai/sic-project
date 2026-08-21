package com.softinter.sicapi.websocket;

import com.softinter.sicapi.dto.request.CallSignalMessage;
import com.softinter.sicapi.dto.request.ChatMessageRequest;
import com.softinter.sicapi.dto.request.GroupMessageRequest;
import com.softinter.sicapi.dto.response.ChatGroupMessageResponse;
import com.softinter.sicapi.dto.response.ChatMessageResponse;
import com.softinter.sicapi.entity.enums.ChatMessageType;
import com.softinter.sicapi.entity.su.SuChatGroup;
import com.softinter.sicapi.entity.su.SuChatGroupLog;
import com.softinter.sicapi.entity.su.SuChatGroupMember;
import com.softinter.sicapi.entity.su.SuChatLog;
import com.softinter.sicapi.repository.su.SuChatGroupLogRepository;
import com.softinter.sicapi.repository.su.SuChatGroupMemberRepository;
import com.softinter.sicapi.repository.su.SuChatGroupRepository;
import com.softinter.sicapi.repository.su.SuChatLogRepository;
import com.softinter.sicapi.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final SuChatLogRepository chatLogRepository;
    private final SuChatGroupRepository chatGroupRepository;
    private final SuChatGroupLogRepository chatGroupLogRepository;
    private final SuChatGroupMemberRepository chatGroupMemberRepository;
    private final CurrentUserService currentUserService;

    @MessageMapping("/chat/private")
    @Transactional
    public void sendPrivateMessage(@Payload ChatMessageRequest request, java.security.Principal principal) {
        String currentUserId = null;
        String currentUsername = null;

        if (principal instanceof org.springframework.security.core.Authentication auth) {
            if (auth.getPrincipal() instanceof org.springframework.security.oauth2.jwt.Jwt jwt) {
                currentUserId = jwt.getSubject() != null ? jwt.getSubject() : jwt.getClaimAsString("sub");
                currentUsername = jwt.getClaimAsString("preferred_username");
            } else if (auth.getName() != null) {
                currentUserId = auth.getName();
            }
        }
        
        if (currentUserId == null) {
            try {
                currentUserId = currentUserService.getUserId();
                currentUsername = currentUserService.getUsername();
            } catch (Exception e) {
                log.warn("Could not determine currentUserId from currentUserService: {}", e.getMessage());
            }
        }

        if (currentUserId == null) {
            log.error("sendPrivateMessage failed: Unauthenticated user");
            return;
        }

        SuChatLog chatLog = new SuChatLog();
        chatLog.setSenderId(currentUserId);
        chatLog.setSenderName(currentUsername != null ? currentUsername : currentUserId);
        chatLog.setReceiverId(request.getReceiverId());
        chatLog.setMessage(request.getMessage() != null ? request.getMessage() : "");
        chatLog.setMessageType(request.getMessageType() != null ? request.getMessageType() : ChatMessageType.TEXT);
        chatLog.setAttachmentId(request.getAttachmentId());
        chatLog.setIsRead(false);
        chatLog.setIsCancelled(false);
        chatLog.setCreatedDate(Instant.now());

        chatLog = chatLogRepository.save(chatLog);

        ChatMessageResponse response = toChatMessageResponse(chatLog);

        // Send to receiver & sender
        messagingTemplate.convertAndSendToUser(request.getReceiverId(), "/queue/messages", response);
        messagingTemplate.convertAndSendToUser(currentUserId, "/queue/messages", response);
    }

    @MessageMapping("/chat/group")
    @Transactional
    public void sendGroupMessage(@Payload GroupMessageRequest request) {
        String currentUserId = currentUserService.getUserId();
        String currentUsername = currentUserService.getUsername();

        SuChatGroup group = chatGroupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        SuChatGroupLog logMsg = new SuChatGroupLog();
        logMsg.setGroup(group);
        logMsg.setSenderId(currentUserId);
        logMsg.setSenderName(currentUsername);
        logMsg.setMessage(request.getMessage() != null ? request.getMessage() : "");
        logMsg.setMessageType(request.getMessageType() != null ? request.getMessageType() : ChatMessageType.TEXT);
        logMsg.setAttachmentId(request.getAttachmentId());
        logMsg.setCreatedDate(Instant.now());

        logMsg = chatGroupLogRepository.save(logMsg);

        ChatGroupMessageResponse response = toGroupMessageResponse(logMsg);
        messagingTemplate.convertAndSend("/topic/group/" + request.getGroupId(), response);
    }

    @MessageMapping("/chat/cancel")
    @Transactional
    public void cancelMessage(@Payload Map<String, String> payload) {
        String messageIdStr = payload.get("messageId");
        if (messageIdStr == null) return;
        UUID messageId = UUID.fromString(messageIdStr);
        String currentUserId = currentUserService.getUserId();

        chatLogRepository.findById(messageId).ifPresent(msg -> {
            if (msg.getSenderId().equals(currentUserId)) {
                msg.setIsCancelled(true);
                msg.setCancelledAt(Instant.now());
                msg.setCancelledBy(currentUserId);
                chatLogRepository.save(msg);

                Map<String, Object> event = Map.of("messageId", messageId.toString(), "isCancelled", true);
                messagingTemplate.convertAndSendToUser(msg.getReceiverId(), "/queue/messages/cancel", event);
                messagingTemplate.convertAndSendToUser(currentUserId, "/queue/messages/cancel", event);
            }
        });
    }

    @MessageMapping("/call/signal")
    @Transactional
    public void handleCallSignal(@Payload CallSignalMessage signal, java.security.Principal principal) {
        String currentUserId = null;
        String currentUsername = null;

        if (principal instanceof org.springframework.security.core.Authentication auth) {
            if (auth.getPrincipal() instanceof org.springframework.security.oauth2.jwt.Jwt jwt) {
                currentUserId = jwt.getSubject() != null ? jwt.getSubject() : jwt.getClaimAsString("sub");
                currentUsername = jwt.getClaimAsString("preferred_username");
            } else if (auth.getName() != null) {
                currentUserId = auth.getName();
            }
        }
        if (currentUserId == null) {
            try {
                currentUserId = currentUserService.getUserId();
                currentUsername = currentUserService.getUsername();
            } catch (Exception e) {
                log.warn("Could not determine currentUserId: {}", e.getMessage());
            }
        }

        if (signal.getCallerId() == null || signal.getCallerId().isBlank()) {
            signal.setCallerId(currentUserId);
        }
        if (signal.getCallerName() == null || signal.getCallerName().isBlank()) {
            signal.setCallerName(currentUsername != null ? currentUsername : currentUserId);
        }

        String action = signal.getAction();
        log.info("📞 WebRTC Signal: action={}, callerId={}, targetUserId={}, groupId={}",
                action, signal.getCallerId(), signal.getTargetUserId(), signal.getGroupId());

        if ("start".equalsIgnoreCase(action)) {
            if (signal.getGroupId() != null && !signal.getGroupId().isBlank()) {
                // Group Call: Broadcast to all group members except caller
                UUID groupId = UUID.fromString(signal.getGroupId());
                List<SuChatGroupMember> members = chatGroupMemberRepository.findByGroupIdAndIsDeleteFalse(groupId);
                for (SuChatGroupMember member : members) {
                    if (!member.getUserId().equals(currentUserId)) {
                        log.info("📞 Forwarding group call to user: {}", member.getUserId());
                        messagingTemplate.convertAndSendToUser(member.getUserId(), "/queue/call", signal);
                    }
                }
            } else if (signal.getTargetUserId() != null) {
                // 1-on-1 Call: Send to target user
                log.info("📞 Forwarding 1-on-1 call to target user: {}", signal.getTargetUserId());
                messagingTemplate.convertAndSendToUser(signal.getTargetUserId(), "/queue/call", signal);
            }
        } else if ("answer".equalsIgnoreCase(action) || "ice-candidate".equalsIgnoreCase(action) || "recording".equalsIgnoreCase(action)) {
            if (signal.getTargetUserId() != null) {
                messagingTemplate.convertAndSendToUser(signal.getTargetUserId(), "/queue/call", signal);
            }
        } else if ("end".equalsIgnoreCase(action)) {
            if (signal.getTargetUserId() != null) {
                messagingTemplate.convertAndSendToUser(signal.getTargetUserId(), "/queue/call", signal);

                // Save call log record in database
                SuChatLog callLog = new SuChatLog();
                callLog.setSenderId(currentUserId);
                callLog.setSenderName(currentUsername);
                callLog.setReceiverId(signal.getTargetUserId());
                callLog.setMessage("วิดีโอคอล/สายสนทนา");
                callLog.setMessageType(ChatMessageType.CALL);
                callLog.setCallAccepted(Boolean.TRUE.equals(signal.getAccepted()));
                callLog.setCallDurationSeconds(signal.getDurationSeconds() != null ? signal.getDurationSeconds() : 0);
                callLog.setCreatedDate(Instant.now());
                chatLogRepository.save(callLog);
            }
        }
    }

    private ChatMessageResponse toChatMessageResponse(SuChatLog logMsg) {
        ChatMessageResponse response = new ChatMessageResponse();
        response.setId(logMsg.getId());
        response.setSenderId(logMsg.getSenderId());
        response.setSenderName(logMsg.getSenderName());
        response.setReceiverId(logMsg.getReceiverId());
        response.setReceiverName(logMsg.getReceiverName());
        response.setMessage(logMsg.getMessage());
        response.setMessageType(logMsg.getMessageType());
        response.setAttachmentId(logMsg.getAttachmentId());
        response.setRead(Boolean.TRUE.equals(logMsg.getIsRead()));
        response.setCancelled(Boolean.TRUE.equals(logMsg.getIsCancelled()));
        response.setCancelledAt(logMsg.getCancelledAt());
        response.setCancelledBy(logMsg.getCancelledBy());
        response.setCallAccepted(logMsg.getCallAccepted());
        response.setCallDurationSeconds(logMsg.getCallDurationSeconds());
        response.setCreatedDate(logMsg.getCreatedDate());
        return response;
    }

    private ChatGroupMessageResponse toGroupMessageResponse(SuChatGroupLog logMsg) {
        ChatGroupMessageResponse response = new ChatGroupMessageResponse();
        response.setId(logMsg.getId());
        if (logMsg.getGroup() != null) {
            response.setGroupId(logMsg.getGroup().getId());
        }
        response.setSenderId(logMsg.getSenderId());
        response.setSenderName(logMsg.getSenderName());
        response.setMessage(logMsg.getMessage());
        response.setMessageType(logMsg.getMessageType());
        response.setAttachmentId(logMsg.getAttachmentId());
        response.setCancelled(Boolean.TRUE.equals(logMsg.getIsCancelled()));
        response.setCancelledAt(logMsg.getCancelledAt());
        response.setCancelledBy(logMsg.getCancelledBy());
        response.setCreatedDate(logMsg.getCreatedDate());
        return response;
    }
}