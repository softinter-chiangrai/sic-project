package com.softinter.sicapi.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.softinter.sicapi.Interceptor.BusinessContextInterceptor;
import com.softinter.sicapi.Interceptor.LanguageInterceptor;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final LanguageInterceptor languageInterceptor;
    private final BusinessContextInterceptor businessContextInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(languageInterceptor)
                .addPathPatterns("/api/**");

        registry.addInterceptor(businessContextInterceptor)
                .addPathPatterns("/api/**");
    }
}