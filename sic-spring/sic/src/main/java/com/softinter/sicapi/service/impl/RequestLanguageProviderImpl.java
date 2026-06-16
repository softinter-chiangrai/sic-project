package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.service.RequestLanguageProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Locale;

@Service
public class RequestLanguageProviderImpl implements RequestLanguageProvider {

    @Override
    public boolean useEnglish() {
        return !"th".equalsIgnoreCase(getLanguage());
    }

    @Override
    public String getLanguage() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpServletRequest request = attrs.getRequest();

            // 1. ✅ ลองอ่าน X-Language-Code ก่อน
            String langHeader = request.getHeader("X-Language-Code");
            if (langHeader != null && !langHeader.isBlank()) {
                if (langHeader.equalsIgnoreCase("th")) return "th";
                if (langHeader.equalsIgnoreCase("en")) return "en";
            }

            // 2. ✅ ถ้าไม่มี X-Language-Code ใช้ Accept-Language
            String acceptLang = request.getHeader("Accept-Language");
            if (acceptLang != null && acceptLang.toLowerCase().startsWith("th")) {
                return "th";
            }

            // 3. Fallback ไปที่ Locale ของ Request
            Locale locale = request.getLocale();
            if (locale != null && "th".equalsIgnoreCase(locale.getLanguage())) {
                return "th";
            }

        } catch (Exception e) {
            // ignore
        }
        return "en";
    }
}