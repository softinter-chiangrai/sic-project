package com.softinter.sicapi.config;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.softinter.sicapi.repository.su.SuBusinessAuditRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRepository;
import com.softinter.sicapi.service.CurrentUserService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class BusinessContextFilter extends OncePerRequestFilter {

    private final SuUserBusinessRepository userBusinessRepository;
    private final SuBusinessAuditRepository businessAuditRepository;
    private final CurrentUserService currentUserService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        try {
            org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !(auth.getPrincipal() instanceof Jwt)) {
                chain.doFilter(request, response);
                return;
            }

            String userId = currentUserService.getUserId();
            if (userId == null) {
                log.warn("No userId found in token");
                chain.doFilter(request, response);
                return;
            }

            // 1. Try from header (if frontend sends it)
            String header = request.getHeader("X-Business-Id");
            if (header != null) {
                try {
                    UUID headerId = UUID.fromString(header);
                    if (userBusinessRepository.canAccessBusiness(userId, headerId)) {
                        BusinessContextHolder.setBusinessId(headerId);
                        log.info("Set businessId from header: {}", headerId);
                        chain.doFilter(request, response);
                        return;
                    }
                } catch (IllegalArgumentException ignored) {}
            }

            // 2. Get all active businesses for the user
            var userBusinesses = userBusinessRepository.findActiveByUserId(userId);
            log.info("Found {} active businesses for user {}", userBusinesses.size(), userId);

            if (!userBusinesses.isEmpty()) {
                // Try default business
                var defaultBiz = userBusinesses.stream()
                        .filter(ub -> Boolean.TRUE.equals(ub.getIsDefault()))
                        .findFirst()
                        .orElse(null);
                if (defaultBiz != null) {
                    UUID bizId = defaultBiz.getBusiness().getId();
                    BusinessContextHolder.setBusinessId(bizId);
                    log.info("Set businessId from default: {}", bizId);
                    chain.doFilter(request, response);
                    return;
                }

                // Fallback to first business
                UUID firstBizId = userBusinesses.get(0).getBusiness().getId();
                BusinessContextHolder.setBusinessId(firstBizId);
                log.info("No default, set businessId from first: {}", firstBizId);
                chain.doFilter(request, response);
                return;
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
                    log.info("Set businessId from audit (session): {}", recentBySession.get(0));
                    chain.doFilter(request, response);
                    return;
                }

                List<UUID> recentByUser = businessAuditRepository.findRecentBusinessIdByUser(
                        userId, userBusinessIds);
                if (!recentByUser.isEmpty()) {
                    BusinessContextHolder.setBusinessId(recentByUser.get(0));
                    log.info("Set businessId from audit (user): {}", recentByUser.get(0));
                    chain.doFilter(request, response);
                    return;
                }

                // Final fallback: first business from IDs
                UUID firstBizId = userBusinessIds.get(0);
                BusinessContextHolder.setBusinessId(firstBizId);
                log.info("Fallback to first businessId: {}", firstBizId);
                chain.doFilter(request, response);
                return;
            }

            log.warn("No accessible business found for userId: {}", userId);
            chain.doFilter(request, response);
        } finally {
            // Clear after the request is fully processed
            BusinessContextHolder.clear();
        }
    }
}