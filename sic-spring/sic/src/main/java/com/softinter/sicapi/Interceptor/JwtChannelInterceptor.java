package com.softinter.sicapi.Interceptor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtDecoder jwtDecoder;

    public JwtChannelInterceptor(@Value("${app.keycloak.auth-server-url}") String keycloakUrl,
                                 @Value("${app.keycloak.realm}") String realm) {
        String jwkSetUri = keycloakUrl + "/realms/" + realm + "/protocol/openid-connect/certs";
        this.jwtDecoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = null;

            // 1. พยายามดึงจาก Header Authorization
            List<String> authorization = accessor.getNativeHeader("Authorization");
            if (authorization != null && !authorization.isEmpty()) {
                String authHeader = authorization.get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            }

            // 2. ถ้าไม่มี Header ให้ลองดึงจาก Query Parameter (SockJS)
            if (token == null) {
                token = accessor.getFirstNativeHeader("access_token");
            }

            // 3. Validate Token
            if (token != null) {
                try {
                    Jwt jwt = jwtDecoder.decode(token);
                    Authentication auth = createAuthentication(jwt);
                    accessor.setUser(auth); // ✅ ตั้งค่า Authentication ให้ Spring Security รู้จัก
                } catch (JwtException e) {
                    // Token ไม่ถูกต้อง -> ปล่อยให้เป็น Anonymous (ไม่ต้อง setUser)
                }
            }
        }

        return message;
    }

    private Authentication createAuthentication(Jwt jwt) {
        String userId = jwt.getSubject();
        if (userId == null) {
            userId = jwt.getClaim("sub");
        }

        List<SimpleGrantedAuthority> authorities = getAuthoritiesFromJwt(jwt);

        return new UsernamePasswordAuthenticationToken(userId, null, authorities);
    }

    private List<SimpleGrantedAuthority> getAuthoritiesFromJwt(Jwt jwt) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        // 1. จาก resource_access.sic-app.roles
        Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
        if (resourceAccess != null) {
            Map<String, Object> clientAccess = (Map<String, Object>) resourceAccess.get("sic-app");
            if (clientAccess != null) {
                List<String> roles = (List<String>) clientAccess.get("roles");
                if (roles != null) {
                    authorities.addAll(roles.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList()));
                }
            }
        }

        // 2. จาก realm_access.roles (optional)
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess != null) {
            List<String> roles = (List<String>) realmAccess.get("roles");
            if (roles != null) {
                authorities.addAll(roles.stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .collect(Collectors.toList()));
            }
        }

        return authorities;
    }
}