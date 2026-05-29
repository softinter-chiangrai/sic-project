package com.softinter.sicapi.controller.su;

import com.softinter.sicapi.dto.request.*;
import com.softinter.sicapi.dto.response.*;
import com.softinter.sicapi.entity.su.*;
import com.softinter.sicapi.repository.su.*;
import com.softinter.sicapi.service.CurrentUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
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

    @GetMapping("/history/{userId}")
    @Operation(summary = "Get chat history with user")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getChatHistory(@PathVariable String userId) {
        String currentUserId = currentUserService.getUserId();
        List<ChatMessageResponse> messages = chatLogRepository.findChatHistory(currentUserId, userId)
                .stream()
                .map(this::toChatMessageResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @PostMapping("/send")
    @Operation(summary = "Send chat message")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(@RequestBody ChatMessageRequest request) {
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

        ChatMessageResponse response = toChatMessageResponse(chatLog);
        messagingTemplate.convertAndSendToUser(request.getReceiverId(), "/queue/messages", response);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/groups")
    @Operation(summary = "Get chat groups")
    public ResponseEntity<ApiResponse<List<ChatGroupResponse>>> getChatGroups() {
        String currentUserId = currentUserService.getUserId();
        List<ChatGroupResponse> groups = chatGroupRepository.findByMemberUserId(currentUserId)
                .stream()
                .map(this::toChatGroupResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(groups));
    }

    @GetMapping("/group/{groupId}/history")
    @Operation(summary = "Get group chat history")
    public ResponseEntity<ApiResponse<List<ChatGroupMessageResponse>>> getGroupChatHistory(@PathVariable UUID groupId) {
        List<ChatGroupMessageResponse> messages = chatGroupLogRepository
                .findByGroupIdAndIsActiveTrueOrderByCreatedDateAsc(groupId)
                .stream()
                .map(this::toGroupMessageResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @PostMapping("/group/create")
    @Operation(summary = "Create chat group")
    public ResponseEntity<ApiResponse<ChatGroupResponse>> createGroup(@RequestBody CreateGroupRequest request) {
        String currentUserId = currentUserService.getUserId();

        SuChatGroup group = new SuChatGroup();
        group.setGroupName(request.getGroupName());
        group.setGroupDescription(request.getGroupDescription());
        group.setCreatedByUserId(currentUserId);
        group.setIsActive(true);
        chatGroupRepository.save(group);

        if (request.getMemberUserIds() != null) {
            for (String memberId : request.getMemberUserIds()) {
                SuChatGroupMember member = new SuChatGroupMember();
                member.setGroup(group);
                member.setUserId(memberId);
                member.setJoinedAt(LocalDateTime.now());
                member.setIsActive(true);
                chatGroupMemberRepository.save(member);
            }
        }

        return ResponseEntity.ok(ApiResponse.success(toChatGroupResponse(group)));
    }

    @PostMapping("/group/send")
    @Operation(summary = "Send group message")
    public ResponseEntity<ApiResponse<ChatGroupMessageResponse>> sendGroupMessage(@RequestBody GroupMessageRequest request) {
        String currentUserId = currentUserService.getUserId();
        String currentUsername = currentUserService.getUsername();

        SuChatGroupLog log = new SuChatGroupLog();
        log.setGroup(chatGroupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found")));
        log.setSenderId(currentUserId);
        log.setSenderName(currentUsername);
        log.setMessage(request.getMessage());
        log.setMessageType(request.getMessageType());
        log.setIsActive(true);
        chatGroupLogRepository.save(log);

        ChatGroupMessageResponse response = toGroupMessageResponse(log);
        messagingTemplate.convertAndSend("/topic/group/" + request.getGroupId(), response);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/group/{groupId}/members")
    @Operation(summary = "Get group members")
    public ResponseEntity<ApiResponse<List<ChatMemberResponse>>> getGroupMembers(@PathVariable UUID groupId) {
        List<ChatMemberResponse> members = chatGroupMemberRepository.findByGroupIdAndIsActiveTrue(groupId)
                .stream()
                .map(this::toMemberResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(members));
    }

    @MessageMapping("/chat.send")
    public void sendWebSocketMessage(@Payload ChatMessageRequest request) {
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

        ChatMessageResponse response = toChatMessageResponse(chatLog);
        messagingTemplate.convertAndSendToUser(request.getReceiverId(), "/queue/messages", response);
    }

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
        response.setCreatedDate(log.getCreatedDate());
        return response;
    }

    private ChatGroupResponse toChatGroupResponse(SuChatGroup group) {
        ChatGroupResponse response = new ChatGroupResponse();
        response.setId(group.getId());
        response.setGroupName(group.getGroupName());
        response.setGroupDescription(group.getGroupDescription());
        response.setCreatedByUserId(group.getCreatedByUserId());
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
        response.setUserName(member.getUserName());
        response.setRole(member.getRole());
        response.setJoinedAt(member.getJoinedAt());
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
        response.setCreatedDate(log.getCreatedDate());
        return response;
    }
}
