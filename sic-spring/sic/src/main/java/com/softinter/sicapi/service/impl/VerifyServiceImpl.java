package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.response.VerifyTokenResponse;
import com.softinter.sicapi.entity.su.SuVerify;
import com.softinter.sicapi.repository.su.SuVerifyRepository;
import com.softinter.sicapi.service.VerifyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class VerifyServiceImpl implements VerifyService {

    private final SuVerifyRepository verifyRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public VerifyTokenResponse generateVerifyToken(String email) {
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

        SuVerify verify = new SuVerify();
        verify.setEmail(email);  // ✅ มีแล้ว
        verify.setToken(token);  // เปลี่ยนจาก setVerifyToken เป็น setToken
        verify.setExpireAt(Instant.now().plus(24, java.time.temporal.ChronoUnit.HOURS));
        verify.setIsVerified(false);
        verify.setRecipient(email);  // ใส่ recipient ด้วย
        verify.setVerifyType("EMAIL_VERIFICATION");  // ใส่ verify type
        verify.setReferenceNumber(email);  // ใส่ reference number
        // verify.setIsActive(true); // ไม่มี field นี้ใน Entity
        verifyRepository.save(verify);

        VerifyTokenResponse response = new VerifyTokenResponse();
        response.setValid(false);
        response.setEmail(email);
        response.setExpiresAt(verify.getExpireAt());  // เปลี่ยนจาก getExpiresAt เป็น getExpireAt
        response.setMessage("Verification token generated successfully");
        return response;
    }

    @Override
    @Transactional
    public VerifyTokenResponse verifyToken(String token) {
        // ต้องแก้ไขใน Repository ด้วย เปลี่ยนจาก findByVerifyTokenAndIsActiveTrue
        SuVerify verify = verifyRepository.findByToken(token)  // ใช้ findByToken แทน
                .orElse(null);

        VerifyTokenResponse response = new VerifyTokenResponse();
        if (verify == null) {
            response.setValid(false);
            response.setMessage("Invalid token");
            return response;
        }

        if (Boolean.TRUE.equals(verify.getIsVerified())) {
            response.setValid(false);
            response.setEmail(verify.getEmail());
            response.setMessage("Token already used");
            return response;
        }

        if (verify.getExpireAt().isBefore(Instant.now())) {  // เปลี่ยนจาก getExpiresAt เป็น getExpireAt
            response.setValid(false);
            response.setEmail(verify.getEmail());
            response.setMessage("Token expired");
            return response;
        }

        verify.setIsVerified(true);
        verify.setVerifiedAt(Instant.now());
        verifyRepository.save(verify);

        response.setValid(true);
        response.setEmail(verify.getEmail());
        response.setMessage("Token verified successfully");
        return response;
    }
}