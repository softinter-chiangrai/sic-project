package com.softinter.sicapi.config;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

/**
 * เข้ารหัส/ถอดรหัส api_key ของ db_ai_model_config ก่อนเก็บลง/อ่านจากฐานข้อมูล (AES-GCM)
 * เพื่อไม่ให้ key ถูกเก็บเป็น plaintext ในตาราง ต่างจาก db_mail_config.password เดิม
 */
@Slf4j
@Component
@Converter(autoApply = false)
public class AiApiKeyConverter implements AttributeConverter<String, String> {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH_BITS = 128;
    private static final int IV_LENGTH_BYTES = 12;

    private final SecretKeySpec secretKey;

    public AiApiKeyConverter(@Value("${app.ai.config-encryption-key:sic-ai-model-config-dev-only-key}") String rawKey) {
        this.secretKey = deriveKey(rawKey);
    }

    @Override
    public String convertToDatabaseColumn(String plainApiKey) {
        if (plainApiKey == null || plainApiKey.isBlank()) {
            return null;
        }
        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));
            byte[] cipherText = cipher.doFinal(plainApiKey.trim().getBytes(StandardCharsets.UTF_8));

            byte[] combined = new byte[iv.length + cipherText.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(cipherText, 0, combined, iv.length, cipherText.length);

            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            log.error("Failed to encrypt AI model api_key: {}", e.getMessage(), e);
            throw new IllegalStateException("Unable to encrypt api_key", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String storedValue) {
        if (storedValue == null || storedValue.isBlank()) {
            return null;
        }
        try {
            byte[] combined = Base64.getDecoder().decode(storedValue);
            byte[] iv = new byte[IV_LENGTH_BYTES];
            byte[] cipherText = new byte[combined.length - IV_LENGTH_BYTES];
            System.arraycopy(combined, 0, iv, 0, IV_LENGTH_BYTES);
            System.arraycopy(combined, IV_LENGTH_BYTES, cipherText, 0, cipherText.length);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));
            byte[] plain = cipher.doFinal(cipherText);
            return new String(plain, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Failed to decrypt AI model api_key: {}", e.getMessage(), e);
            return null;
        }
    }

    private SecretKeySpec deriveKey(String rawKey) {
        try {
            // ยอมให้ config key เป็น string ความยาวเท่าไหร่ก็ได้ -> hash เป็น 256-bit key ที่แน่นอนด้วย SHA-256
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = sha256.digest(rawKey.getBytes(StandardCharsets.UTF_8));
            return new SecretKeySpec(keyBytes, "AES");
        } catch (Exception e) {
            throw new IllegalStateException("Unable to derive AI model config encryption key", e);
        }
    }
}
