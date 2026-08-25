package com.softinter.sicapi.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;

import javax.imageio.ImageIO;
import java.awt.Image;
import java.io.ByteArrayInputStream;
import java.io.InputStream;

@Slf4j
public final class ReportHelper {

    private ReportHelper() {}

    /**
     * Loads the company logo image as a ByteArrayInputStream so it remains open and readable during JasperReports filling.
     */
    public static InputStream getLogoInputStream() {
        try {
            ClassPathResource logoRes = new ClassPathResource("images/softinter_logo.png");
            if (logoRes.exists()) {
                try (InputStream is = logoRes.getInputStream()) {
                    return new ByteArrayInputStream(is.readAllBytes());
                }
            }
        } catch (Exception e) {
            log.warn("Could not load company logo image: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Loads the company logo as a BufferedImage in memory.
     */
    public static Image getLogoImage() {
        try {
            ClassPathResource logoRes = new ClassPathResource("images/softinter_logo.png");
            if (logoRes.exists()) {
                try (InputStream is = logoRes.getInputStream()) {
                    return ImageIO.read(is);
                }
            }
        } catch (Exception e) {
            log.warn("Could not load company logo image as AWT Image: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Adjusts Thai text (upper vowels, tone marks) to PUA codes for perfect PDF rendering with TH Sarabun New.
     */
    public static String thaify(String text) {
        return ThaiGlyphUtil.adjust(text);
    }
}
