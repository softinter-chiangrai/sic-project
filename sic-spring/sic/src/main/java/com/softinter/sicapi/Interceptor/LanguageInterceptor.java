package com.softinter.sicapi.Interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Locale;

@Component
public class LanguageInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // อ่าน X-Language-Code จาก Header
        String lang = request.getHeader("X-Language-Code");
        if (lang != null && (lang.equalsIgnoreCase("th") || lang.equalsIgnoreCase("en"))) {
            LocaleContextHolder.setLocale(new Locale(lang.toLowerCase()));
        } else {
            // ถ้าไม่มี ใช้ Accept-Language
            LocaleContextHolder.setLocale(request.getLocale());
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // ล้าง Locale หลังจบ Request (ป้องกัน memory leak)
        LocaleContextHolder.resetLocaleContext();
    }
}
