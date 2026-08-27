package com.softinter.sicapi.Interceptor;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.repository.su.SuBusinessAuditRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRepository;
import com.softinter.sicapi.service.CurrentUserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class BusinessContextInterceptor implements HandlerInterceptor {

    private final SuUserBusinessRepository userBusinessRepository;
    private final SuBusinessAuditRepository businessAuditRepository;
    private final CurrentUserService currentUserService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !(auth.getPrincipal() instanceof Jwt)) {
                return true;
            }

            String userId;
            try {
                userId = currentUserService.getUserId();
            } catch (Exception e) {
                return true;
            }

            if (userId == null) {
                return true;
            }

            // 1. Try from header (if frontend sends it)
            String header = request.getHeader("X-Business-Id");
            if (header != null) {
                try {
                    UUID headerId = UUID.fromString(header);
                    if (userBusinessRepository.canAccessBusiness(userId, headerId)) {
                        BusinessContextHolder.setBusinessId(headerId);
                        log.debug("Set businessId from header: {}", headerId);
                        return true;
                    }
                } catch (IllegalArgumentException ignored) {}
            }

            // 2. Get all active businesses for the user
            var userBusinesses = userBusinessRepository.findActiveByUserId(userId);
            if (!userBusinesses.isEmpty()) {
                // Try default business
                var defaultBiz = userBusinesses.stream()
                        .filter(ub -> Boolean.TRUE.equals(ub.getIsDefault()))
                        .findFirst()
                        .orElse(null);
                if (defaultBiz != null) {
                    UUID bizId = defaultBiz.getBusiness().getId();
                    BusinessContextHolder.setBusinessId(bizId);
                    log.debug("Set businessId from default: {}", bizId);
                    return true;
                }

                // Fallback to first business
                UUID firstBizId = userBusinesses.get(0).getBusiness().getId();
                BusinessContextHolder.setBusinessId(firstBizId);
                log.debug("No default, set businessId from first: {}", firstBizId);
                return true;
            }

            // 3. Fallback: audit trail (session + clientIp)
            List<UUID> userBusinessIds = userBusinessRepository.findBusinessIdsByUserId(userId);
            if (!userBusinessIds.isEmpty()) {
                String sessionId = currentUserService.getSessionId();
                String clientIp = currentUserService.getIpAddress();

                List<UUID> recentBySession = businessAuditRepository.findRecentBusinessIdBySession(
                        sessionId, userId, clientIp, userBusinessIds);
                if (!recentBySession.isEmpty()) {
                    BusinessContextHolder.setBusinessId(recentBySession.get(0));
                    log.debug("Set businessId from audit (session): {}", recentBySession.get(0));
                    return true;
                }

                List<UUID> recentByUser = businessAuditRepository.findRecentBusinessIdByUser(
                        userId, userBusinessIds);
                if (!recentByUser.isEmpty()) {
                    BusinessContextHolder.setBusinessId(recentByUser.get(0));
                    log.debug("Set businessId from audit (user): {}", recentByUser.get(0));
                    return true;
                }

                // Final fallback: first business from IDs
                UUID firstBizId = userBusinessIds.get(0);
                BusinessContextHolder.setBusinessId(firstBizId);
                log.debug("Fallback to first businessId: {}", firstBizId);
                return true;
            }
        } catch (Exception e) {
            log.error("Error setting business context in interceptor", e);
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        BusinessContextHolder.clear();
    }
}
