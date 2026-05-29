package com.softinter.sicapi.config;

import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.repository.su.SuUserBusinessRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 100)
public class BusinessContextFilter implements Filter {

    private final SuUserBusinessRepository userBusinessRepository;
    private final CurrentUserService currentUserService;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
                String userId = currentUserService.getUserId();
                var defaultBusiness = userBusinessRepository.findActiveByUserId(userId)
                        .stream()
                        .filter(ub -> Boolean.TRUE.equals(ub.getIsDefault()))
                        .findFirst()
                        .orElse(null);

                if (defaultBusiness != null) {
                    BusinessContextHolder.setBusinessId(defaultBusiness.getBusiness().getId());
                }
            }
            chain.doFilter(request, response);
        } finally {
            BusinessContextHolder.clear();
        }
    }
}
