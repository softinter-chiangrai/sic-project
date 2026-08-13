package com.softinter.sicapi.controller.su;

import com.softinter.sicapi.dto.response.NotificationResponse;
import com.softinter.sicapi.entity.su.SuNotification;
import com.softinter.sicapi.repository.su.SuNotificationRepository;
import com.softinter.sicapi.service.CurrentUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/su/notifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Notifications", description = "User Notification Center API")
public class NotificationController {

    private final SuNotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;

    @GetMapping
    @Operation(summary = "Get user notifications")
    public ResponseEntity<List<NotificationResponse>> getNotifications() {
        String currentUserId = currentUserService.getUserId();
        List<NotificationResponse> notifications = notificationRepository
                .findByRecipientUserIdOrderByCreatedDateDesc(currentUserId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        String currentUserId = currentUserService.getUserId();
        long count = notificationRepository.countUnreadByRecipientUserId(currentUserId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PutMapping("/{id}/read")
    @Transactional
    @Operation(summary = "Mark single notification as read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id) {
        String currentUserId = currentUserService.getUserId();
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getRecipientUserId().equals(currentUserId)) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        });
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    @Transactional
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Void> markAllAsRead() {
        String currentUserId = currentUserService.getUserId();
        notificationRepository.markAllAsReadForUser(currentUserId);
        return ResponseEntity.ok().build();
    }

    private NotificationResponse toResponse(SuNotification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setRecipientUserId(notification.getRecipientUserId());
        response.setSenderId(notification.getSenderId());
        response.setSenderName(notification.getSenderName());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType());
        response.setLinkUrl(notification.getLinkUrl());
        response.setRead(Boolean.TRUE.equals(notification.getIsRead()));
        response.setCreatedDate(notification.getCreatedDate());
        return response;
    }
}
