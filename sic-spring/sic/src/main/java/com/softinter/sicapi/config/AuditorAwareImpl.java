package com.softinter.sicapi.config;

import com.softinter.sicapi.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("auditorAwareImpl")
@RequiredArgsConstructor
public class AuditorAwareImpl implements AuditorAware<String> {

    private final CurrentUserService currentUserService;

    @Override
    public Optional<String> getCurrentAuditor() {
        try {
            return Optional.ofNullable(currentUserService.getUserId());
        } catch (Exception e) {
            return Optional.of("system");
        }
    }
}
