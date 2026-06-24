package com.softinter.sicapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JoinBusinessRequest {
    @NotBlank(message = "Token is required")
    private String token;
}