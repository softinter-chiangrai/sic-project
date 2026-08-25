package com.softinter.sicapi.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;

@Slf4j
public class ReportHelper {

    private static final String LOGO_PATH = "images/softinter_logo.png";

    private ReportHelper() {}

    /**
     * คืนค่า InputStream ของรูป Logo บริษัท (หรือ null ถ้าไม่พบไฟล์)
     */
    public static InputStream getLogoInputStream() {
        try {
            ClassPathResource resource = new ClassPathResource(LOGO_PATH);
            if (resource.exists()) {
                return resource.getInputStream();
            }
            log.warn("Report logo not found at classpath: {}", LOGO_PATH);
        } catch (Exception e) {
            log.warn("Could not load report logo from {}: {}", LOGO_PATH, e.getMessage());
        }
        return null;
    }
}
