package com.softinter.sicapi.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.report-service")
public class ReportServiceProperties {
    private boolean enabled = true;
    private String baseUrl = "http://localhost:80";
    private String accessToken = "sw7vuLj4VcTyksKN9ZFNYDRmtu_O2uYk";
    private int timeoutSeconds = 30;
    private boolean fallbackToLocal = true;
}
