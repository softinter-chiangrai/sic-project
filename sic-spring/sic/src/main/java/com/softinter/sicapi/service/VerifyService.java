package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.response.VerifyTokenResponse;

public interface VerifyService {
    VerifyTokenResponse generateVerifyToken(String email);
    VerifyTokenResponse verifyToken(String token);
}
