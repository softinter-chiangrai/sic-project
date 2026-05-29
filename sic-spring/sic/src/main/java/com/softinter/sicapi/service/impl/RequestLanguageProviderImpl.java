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
            String lang = request.getHeader("Accept-Language");
            if (lang != null && lang.toLowerCase().startsWith("th")) {
                return "th";
            }
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
