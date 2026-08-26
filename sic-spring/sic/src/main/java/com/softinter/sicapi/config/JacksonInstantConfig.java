package com.softinter.sicapi.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Configuration
public class JacksonInstantConfig {

    /**
     * Custom Deserializer สำหรับ Instant
     * รองรับทั้ง ISO-8601 Instant เต็มรูปแบบ (เช่น 2027-07-31T00:00:00Z, 2027-07-31T15:30:00.123+07:00)
     * และ Date-only format (เช่น 2027-07-31) โดยจะแปลงเป็น Instant ที่จุดเริ่มต้นของวัน UTC
     */
    public static class FlexibleInstantDeserializer extends JsonDeserializer<Instant> {
        @Override
        public Instant deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            String text = p.getText();
            if (text == null || text.trim().isEmpty()) {
                return null;
            }
            text = text.trim();

            // 1. ลอง parse แบบ ISO Instant มาตรฐานก่อน (เช่น 2027-07-31T00:00:00Z หรือ offset ต่างๆ)
            try {
                return Instant.parse(text);
            } catch (DateTimeParseException ignored) {
            }

            // 2. ลอง parse กรณีมี timezone offset อื่นๆ (เช่น 2027-07-31T00:00:00+07:00)
            try {
                return java.time.OffsetDateTime.parse(text).toInstant();
            } catch (DateTimeParseException ignored) {
            }

            // 3. กรณีส่งมาเฉพาะวันที่ (เช่น 2027-07-31 หรือ 2027/07/31)
            try {
                if (text.contains("/")) {
                    text = text.replace('/', '-');
                }
                LocalDate localDate = LocalDate.parse(text, DateTimeFormatter.ISO_LOCAL_DATE);
                return localDate.atStartOfDay(ZoneOffset.UTC).toInstant();
            } catch (DateTimeParseException ignored) {
            }

            // 4. กรณีส่งมาเป็น Epoch Millisecond
            try {
                long epochMilli = Long.parseLong(text);
                return Instant.ofEpochMilli(epochMilli);
            } catch (NumberFormatException ignored) {
            }

            throw new IllegalArgumentException("Cannot deserialize value to java.time.Instant: " + text);
        }
    }

    @Bean
    public SimpleModule instantDeserializerModule() {
        SimpleModule module = new SimpleModule();
        module.addDeserializer(Instant.class, new FlexibleInstantDeserializer());
        return module;
    }
}
