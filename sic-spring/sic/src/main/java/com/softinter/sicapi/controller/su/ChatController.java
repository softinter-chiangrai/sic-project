package com.softinter.sicapi.controller.su;

import com.softinter.sicapi.dto.request.*;
import com.softinter.sicapi.dto.response.*;
import com.softinter.sicapi.entity.su.*;
import com.softinter.sicapi.repository.su.*;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.SuUserBusinessService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/su/chat")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Chat", description = "Chat API")
public class ChatController {

    private final SuChatLogRepository chatLogRepository;
    private final SuChatGroupRepository chatGroupRepository;
    private final SuChatGroupMemberRepository chatGroupMemberRepository;
    private final SuChatGroupLogRepository chatGroupLogRepository;
    private final CurrentUserService currentUserService;
    private final SimpMessagingTemplate messagingTemplate;

    private final SuUserBusinessService userBusinessService;

    // ========== Private Chat ==========

    @GetMapping("/history/{userId}")
    @Operation(summary = "Get chat history with user")
    public ResponseEntity<List<ChatMessageResponse>> getChatHistory(@PathVariable String userId) {
        String currentUserId = currentUserService.getUserId();
        List<ChatMessageResponse> messages = chatLogRepository.findChatHistory(currentUserId, userId)
                .stream()
                .map(this::toChatMessageResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/send")
    @Operation(summary = "Send chat message")
    public ResponseEntity<ChatMessageResponse> sendMessage(@RequestBody ChatMessageRequest request) {
        String currentUserId = currentUserService.getUserId();
        String currentUsername = currentUserService.getUsername();

        SuChatLog chatLog = new SuChatLog();
        chatLog.setSenderId(currentUserId);
        chatLog.setSenderName(currentUsername);
        chatLog.setReceiverId(request.getReceiverId());
        chatLog.setMessage(request.getMessage());
        chatLog.setMessageType(request.getMessageType());
        chatLog.setIsRead(false);
        chatLog.setCreatedDate(Instant.now());
        chatLogRepository.save(chatLog);

        ChatMessageResponse response = toChatMessageResponse(chatLog);
        messagingTemplate.convertAndSendToUser(request.getReceiverId(), "/queue/messages", response);
        return ResponseEntity.ok(response);
    }

    // ========== Chat Groups ==========

    @GetMapping("/groups")
    @Operation(summary = "Get chat groups")
    public ResponseEntity<List<ChatGroupResponse>> getChatGroups() {
        String currentUserId = currentUserService.getUserId();
        List<ChatGroupResponse> groups = chatGroupRepository.findByMemberUserId(currentUserId)
                .stream()
                .map(this::toChatGroupResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/members")
    @Operation(summary = "Get all available chat members in system/business")
    public ResponseEntity<List<ChatMemberResponse>> getChatMembers() {
        String currentUserId = currentUserService.getUserId();

        List<UserResponse> availableUsers = userBusinessService.getAvailableUsers();

        List<ChatMemberResponse> members = availableUsers.stream()
                .filter(u -> !u.getId().equals(currentUserId))
                .map(u -> {
                    ChatMemberResponse member = new ChatMemberResponse();
                    member.setUserId(u.getId());
                    member.setUserName(u.getName());
                    return member;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(members);
    }

    @GetMapping("/group/{groupId}/history")
    @Operation(summary = "Get group chat history")
    public ResponseEntity<List<ChatGroupMessageResponse>> getGroupChatHistory(@PathVariable UUID groupId) {
        List<ChatGroupMessageResponse> messages = chatGroupLogRepository
                .findByGroupIdAndIsDeleteFalseOrderByCreatedDateAsc(groupId)
                .stream()
                .map(this::toGroupMessageResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/group/create")
    @Operation(summary = "Create chat group")
    public ResponseEntity<ChatGroupResponse> createGroup(@RequestBody CreateGroupRequest request) {
        String currentUserId = currentUserService.getUserId();
        UUID businessId = currentUserService.getBusinessId();
        if (businessId == null) {
            List<UserBusinessResponse> ubs = userBusinessService.findByUserId(currentUserId);
            if (!ubs.isEmpty() && ubs.get(0).getBusinessId() != null) {
                businessId = ubs.get(0).getBusinessId();
            } else {
                // Fallback default
                businessId = UUID.fromString("00000000-0000-0000-0000-000000000000");
            }
        }

        SuChatGroup group = new SuChatGroup();
        group.setName(request.getName());
        group.setBusinessId(businessId);
        group.setCreatedBy(currentUserId);
        group.setCreatedDate(Instant.now());

        chatGroupRepository.save(group);

        SuChatGroupMember creatorMember = new SuChatGroupMember();
        creatorMember.setGroup(group);
        creatorMember.setUserId(currentUserId);
        creatorMember.setBusinessId(businessId);
        creatorMember.setCreatedBy(currentUserId);
        creatorMember.setCreatedDate(Instant.now());
        chatGroupMemberRepository.save(creatorMember);

        if (request.getMemberUserIds() != null) {
            for (String otherUserId : request.getMemberUserIds()) {
                if (!otherUserId.equals(currentUserId)) {
                    SuChatGroupMember member = new SuChatGroupMember();
                    member.setGroup(group);
                    member.setUserId(otherUserId);
                    member.setBusinessId(businessId);
                    member.setCreatedBy(currentUserId);
                    member.setCreatedDate(Instant.now());
                    chatGroupMemberRepository.save(member);
                }
            }
        }

        return ResponseEntity.ok(toChatGroupResponse(group));
    }

    @PostMapping("/group/send")
    @Operation(summary = "Send group message")
    public ResponseEntity<ChatGroupMessageResponse> sendGroupMessage(@RequestBody GroupMessageRequest request) {
        String currentUserId = currentUserService.getUserId();
        String currentUsername = currentUserService.getUsername();

        SuChatGroup group = chatGroupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        SuChatGroupLog log = new SuChatGroupLog();
        log.setGroup(group);
        log.setSenderId(currentUserId);
        log.setSenderName(currentUsername);
        log.setMessage(request.getMessage());
        log.setMessageType(request.getMessageType());
        log.setCreatedDate(Instant.now());
        chatGroupLogRepository.save(log);

        ChatGroupMessageResponse response = toGroupMessageResponse(log);
        messagingTemplate.convertAndSend("/topic/group/" + request.getGroupId(), response);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/group/{groupId}/members")
    @Operation(summary = "Get group members")
    public ResponseEntity<List<ChatMemberResponse>> getGroupMembers(@PathVariable UUID groupId) {
        List<ChatMemberResponse> members = chatGroupMemberRepository.findByGroupIdAndIsDeleteFalse(groupId)
                .stream()
                .map(this::toMemberResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(members);
    }

    @PostMapping("/cancel/{messageId}")
    @Operation(summary = "Cancel / Delete chat message")
    public ResponseEntity<Void> cancelChatMessage(@PathVariable UUID messageId) {
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
        return ResponseEntity.ok().build();
    }

    @PostMapping("/edit/{messageId}")
    @Operation(summary = "Edit chat message")
    public ResponseEntity<ChatMessageResponse> editChatMessage(@PathVariable UUID messageId,
            @RequestBody Map<String, String> body) {
        String newText = body.get("message");
        if (newText == null)
            return ResponseEntity.badRequest().build();
        String currentUserId = currentUserService.getUserId();

        SuChatLog msg = chatLogRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        if (!msg.getSenderId().equals(currentUserId)) {
            return ResponseEntity.status(403).build();
        }
        msg.setMessage(newText);
        msg.setUpdatedDate(Instant.now());
        chatLogRepository.save(msg);

        ChatMessageResponse response = toChatMessageResponse(msg);
        messagingTemplate.convertAndSendToUser(msg.getReceiverId(), "/queue/messages/edit", response);
        messagingTemplate.convertAndSendToUser(currentUserId, "/queue/messages/edit", response);
        return ResponseEntity.ok(response);
    }

    // ========== Private Helper Methods ==========

    private ChatMessageResponse toChatMessageResponse(SuChatLog log) {
        ChatMessageResponse response = new ChatMessageResponse();
        response.setId(log.getId());
        response.setSenderId(log.getSenderId());
        response.setSenderName(log.getSenderName());
        response.setReceiverId(log.getReceiverId());
        response.setReceiverName(log.getReceiverName());
        response.setMessage(log.getMessage());
        response.setMessageType(log.getMessageType());
        response.setAttachmentId(log.getAttachmentId());
        response.setRead(Boolean.TRUE.equals(log.getIsRead()));
        response.setCancelled(Boolean.TRUE.equals(log.getIsCancelled()));
        response.setCancelledAt(log.getCancelledAt());
        response.setCancelledBy(log.getCancelledBy());
        response.setCallAccepted(log.getCallAccepted());
        response.setCallDurationSeconds(log.getCallDurationSeconds());
        response.setCreatedDate(log.getCreatedDate());
        return response;
    }

    private ChatGroupResponse toChatGroupResponse(SuChatGroup group) {
        ChatGroupResponse response = new ChatGroupResponse();
        response.setId(group.getId());
        response.setName(group.getName());
        response.setCreatedByUserId(group.getCreatedBy());
        response.setCreatedDate(group.getCreatedDate());
        if (group.getMembers() != null) {
            response.setMembers(group.getMembers().stream()
                    .map(this::toMemberResponse)
                    .collect(Collectors.toList()));
        }
        return response;
    }

    private ChatMemberResponse toMemberResponse(SuChatGroupMember member) {
        ChatMemberResponse response = new ChatMemberResponse();
        response.setId(member.getId());
        if (member.getGroup() != null) {
            response.setGroupId(member.getGroup().getId());
        }
        response.setUserId(member.getUserId());
        return response;
    }

    private ChatGroupMessageResponse toGroupMessageResponse(SuChatGroupLog log) {
        ChatGroupMessageResponse response = new ChatGroupMessageResponse();
        response.setId(log.getId());
        if (log.getGroup() != null) {
            response.setGroupId(log.getGroup().getId());
        }
        response.setSenderId(log.getSenderId());
        response.setSenderName(log.getSenderName());
        response.setMessage(log.getMessage());
        response.setMessageType(log.getMessageType());
        response.setAttachmentId(log.getAttachmentId());
        response.setCancelled(Boolean.TRUE.equals(log.getIsCancelled()));
        response.setCancelledAt(log.getCancelledAt());
        response.setCancelledBy(log.getCancelledBy());
        response.setCreatedDate(log.getCreatedDate());
        return response;
    }
}