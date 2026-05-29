package com.softinter.sicapi.dto.request;

import lombok.Data;

@Data
public class VerifyTokenRequest {
    private String email;
    private String token;
}
