package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.response.VerifyTokenResponse;
import com.softinter.sicapi.entity.su.SuVerify;
import com.softinter.sicapi.repository.su.SuVerifyRepository;
import com.softinter.sicapi.service.MailService;
import com.softinter.sicapi.service.VerifyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerifyServiceImpl implements VerifyService {

    private final SuVerifyRepository verifyRepository;
    private final MailService mailService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public VerifyTokenResponse generateVerifyToken(String recipient) {
        try {
            log.info("📧 Starting verification for: {}", recipient);

            if (recipient == null || recipient.trim().isEmpty()) {
                throw new IllegalArgumentException("Recipient cannot be null or empty");
            }

            // Generate token
            byte[] tokenBytes = new byte[32];
            secureRandom.nextBytes(tokenBytes);
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

            // Generate reference number
            String referenceNumber = UUID.randomUUID().toString();

            // Save to database
            SuVerify verify = new SuVerify();
            verify.setRecipient(recipient);
            verify.setToken(token);
            verify.setReferenceNumber(referenceNumber);
            verify.setExpireAt(Instant.now().plus(24, java.time.temporal.ChronoUnit.HOURS));
            verify.setVerifyType("Email");

            SuVerify saved = verifyRepository.save(verify);
            log.debug("Saved verify with id: {}", saved.getId());

            // Prepare response
            VerifyTokenResponse response = new VerifyTokenResponse();
            response.setValid(false);
            response.setVerifyType("Email");
            response.setReferenceNumber(referenceNumber);
            response.setRecipient(recipient);
            response.setExpirationMinutes(1440);
            response.setMaxRetry(5);
            response.setExpiresAt(verify.getExpireAt());
            response.setMessage("Verification token generated successfully");

            // Send email
            try {
                mailService.sendTemplatedMail(recipient, "VERIFY_EMAIL", token, referenceNumber);
                log.info("✅ Email sent to: {}", recipient);
            } catch (Exception e) {
                log.error("❌ Failed to send email: {}", recipient, e);
            }

            return response;

        } catch (Exception e) {
            log.error("Failed to generate verification token", e);
            throw new RuntimeException("An error occurred while generating verification token", e);
        }
    }

    // ===========================
    // Method เดิม (ใช้ token อย่างเดียว) – เก็บไว้เพื่อ backward compatibility
    // ===========================
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

        if (verify.getExpireAt().isBefore(Instant.now())) {
            response.setValid(false);
            response.setRecipient(verify.getRecipient());
            response.setMessage("Token expired");
            return response;
        }

        // Soft delete after use
        verify.setIsDelete(true);
        verify.setDeleteBy("system");
        verify.setDeleteDate(Instant.now());
        verifyRepository.save(verify);

        response.setValid(true);
        response.setRecipient(verify.getRecipient());
        response.setMessage("Token verified successfully");
        return response;
    }

    // ===========================
    // Method ใหม่ ที่รับ referenceNumber + token (เหมือน .NET)
    // ===========================
    @Override
    @Transactional
    public VerifyTokenResponse verifyToken(String type, String referenceNumber, String token) {
        SuVerify verify = verifyRepository.findByVerifyTypeAndReferenceNumberAndToken(type, referenceNumber, token).orElse(null);

        VerifyTokenResponse response = new VerifyTokenResponse();
        if (verify == null) {
            response.setValid(false);
            response.setMessage("Invalid reference number or token");
            return response;
        }

        // ถ้า token ถูกใช้ไปแล้ว (soft delete)
        if (verify.getIsDelete() != null && verify.getIsDelete()) {
            response.setValid(false);
            response.setRecipient(verify.getRecipient());
            response.setMessage("Token already used");
            return response;
        }

        if (verify.getExpireAt().isBefore(Instant.now())) {
            response.setValid(false);
            response.setRecipient(verify.getRecipient());
            response.setMessage("Token expired");
            return response;
        }

        // Soft delete after successful verification (same as .NET)
        verify.setIsDelete(true);
        verify.setDeleteBy("system");
        verify.setDeleteDate(Instant.now());
        verifyRepository.save(verify);

        response.setValid(true);
        response.setRecipient(verify.getRecipient());
        response.setReferenceNumber(verify.getReferenceNumber());
        response.setMessage("Token verified successfully");
        return response;
    }
}