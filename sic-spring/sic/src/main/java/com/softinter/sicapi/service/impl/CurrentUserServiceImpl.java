package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.service.CurrentUserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
@Service
@RequiredArgsConstructor
public class CurrentUserServiceImpl implements CurrentUserService {

    @Override
    public String getUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt.getSubject();
        }
        throw new UnauthorizedException("No authenticated user found");
    }

    @Override
    public String getSessionId() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpServletRequest request = attrs.getRequest();
            String sessionId = request.getHeader("X-Session-Id");
            if (sessionId != null) {
                return sessionId;
            }
            return request.getSession(true).getId();
        } catch (Exception e) {
            return "system";
        }
    }

    @Override
    public String getIpAddress() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpServletRequest request = attrs.getRequest();
            String xfHeader = request.getHeader("X-Forwarded-For");
            if (xfHeader != null) {
                return xfHeader.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        } catch (Exception e) {
            return "unknown";
        }
    }

    @Override
    public String getUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt.getClaimAsString("preferred_username");
        }
        return "system";
    }
}
