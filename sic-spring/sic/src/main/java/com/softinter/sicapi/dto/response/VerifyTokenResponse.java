package com.softinter.sicapi.dto.response;

import lombok.Data;

import java.time.Instant;

@Data
public class VerifyTokenResponse {
    private boolean valid;
    private String email;
    private Instant expiresAt;
    private String message;
}
