package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.response.UserStatusResponse;
import com.softinter.sicapi.service.UserSessionTracker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserSessionTrackerImpl implements UserSessionTracker {

    private final SimpMessagingTemplate messagingTemplate;

    // Map of sessionId -> userId
    private final Map<String, String> sessionUserMap = new ConcurrentHashMap<>();

    // Map of userId -> Set of sessionIds (one user can have multiple tabs)
    private final Map<String, Set<String>> userSessionsMap = new ConcurrentHashMap<>();

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();

        if (principal != null && principal.getName() != null) {
            String userId = principal.getName();
            String sessionId = headerAccessor.getSessionId();

            if (sessionId != null) {
                sessionUserMap.put(sessionId, userId);
                userSessionsMap.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(sessionId);

                log.info("User connected: {} (Session: {})", userId, sessionId);
                broadcastUserStatus(userId, true);
            }
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        if (sessionId != null) {
            String userId = sessionUserMap.remove(sessionId);
            if (userId != null) {
                Set<String> sessions = userSessionsMap.get(userId);
                if (sessions != null) {
                    sessions.remove(sessionId);
                    if (sessions.isEmpty()) {
                        userSessionsMap.remove(userId);
                        log.info("User fully disconnected: {}", userId);
                        broadcastUserStatus(userId, false);
                    }
                }
            }
        }
    }

    @Override
    public boolean isUserOnline(String userId) {
        if (userId == null) return false;
        Set<String> sessions = userSessionsMap.get(userId);
        return sessions != null && !sessions.isEmpty();
    }

    private void broadcastUserStatus(String userId, boolean isOnline) {
        try {
            UserStatusResponse payload = UserStatusResponse.builder()
                    .userId(userId)
                    .isOnline(isOnline)
                    .build();
            messagingTemplate.convertAndSend("/topic/user-status", (Object) payload);
        } catch (Exception e) {
            log.error("Failed to broadcast user status for {}: {}", userId, e.getMessage());
        }
    }
}
