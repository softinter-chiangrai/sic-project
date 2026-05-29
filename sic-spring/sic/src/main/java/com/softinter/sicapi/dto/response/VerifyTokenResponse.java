package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VerifyTokenResponse {
    private boolean valid;
    private String email;
    private LocalDateTime expiresAt;
    private String message;
}
