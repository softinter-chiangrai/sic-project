package com.softinter.sicapi.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.softinter.sicapi.Interceptor.LanguageInterceptor;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final LanguageInterceptor languageInterceptor;

    public WebConfig(LanguageInterceptor languageInterceptor) {
        this.languageInterceptor = languageInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(languageInterceptor)
                .addPathPatterns("/api/**");  // ใช้กับทุก API
    }
}