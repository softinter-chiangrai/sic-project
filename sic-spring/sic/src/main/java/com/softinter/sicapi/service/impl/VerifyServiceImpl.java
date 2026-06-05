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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VerifyServiceImpl implements VerifyService {

    private final SuVerifyRepository verifyRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public VerifyTokenResponse generateVerifyToken(String email) {
        // ✅ เพิ่ม log ตรงนี้
        System.out.println("=== DEBUG: Email received = [" + email + "]");
        
        if (email == null || email.trim().isEmpty()) {
            System.err.println("=== ERROR: Email is null or empty!");
            throw new IllegalArgumentException("Email cannot be null or empty");
        }
        
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

        SuVerify verify = new SuVerify();
        verify.setRecipient(email);
        verify.setToken(token);
        verify.setExpireAt(Instant.now().plus(24, java.time.temporal.ChronoUnit.HOURS));
        verify.setIsVerified(false);
        verify.setVerifyType("EMAIL_VERIFICATION");
        verify.setReferenceNumber(UUID.randomUUID().toString());
        
        SuVerify saved = verifyRepository.save(verify);
        System.out.println("=== DEBUG: Saved verify with id: " + saved.getId());
        System.out.println("=== DEBUG: Saved recipient: " + saved.getRecipient());

        VerifyTokenResponse response = new VerifyTokenResponse();
        response.setValid(false);
        response.setEmail(email);
        response.setExpiresAt(verify.getExpireAt());
        response.setMessage("Verification token generated successfully");
        return response;
    }

    @Override
    @Transactional
    public VerifyTokenResponse verifyToken(String token) {
        SuVerify verify = verifyRepository.findByToken(token).orElse(null);

        VerifyTokenResponse response = new VerifyTokenResponse();
        if (verify == null) {
            response.setValid(false);
            response.setMessage("Invalid token");
            return response;
        }

        if (Boolean.TRUE.equals(verify.getIsVerified())) {
            response.setValid(false);
            response.setEmail(verify.getRecipient());
            response.setMessage("Token already used");
            return response;
        }

        if (verify.getExpireAt().isBefore(Instant.now())) {
            response.setValid(false);
            response.setEmail(verify.getRecipient());
            response.setMessage("Token expired");
            return response;
        }

        verify.setIsVerified(true);
        verify.setVerifiedAt(Instant.now());
        verifyRepository.save(verify);

        response.setValid(true);
        response.setEmail(verify.getRecipient());
        response.setMessage("Token verified successfully");
        return response;
    }
}