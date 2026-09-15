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

    /**
     * แปลง HTML Rich Text ให้เป็น Plain Text ที่จัดรูปแบบสวยงามสำหรับรายงาน PDF
     * เช่น จัดการลำดับเลข <ol><li> ให้เป็น 1. 2. 3. และ <ul><li> ให้เป็น • 
     */
    public static String htmlToPlainText(String html) {
        if (html == null || html.isBlank() || "-".equals(html.trim())) {
            return "-";
        }

        String text = html;

        // 1. Process Ordered Lists <ol>...</ol> -> 1. , 2. , 3. ...
        java.util.regex.Pattern olPattern = java.util.regex.Pattern.compile("(?is)<ol[^>]*>(.*?)</ol>");
        java.util.regex.Matcher olMatcher = olPattern.matcher(text);
        StringBuilder sb = new StringBuilder();
        while (olMatcher.find()) {
            String olContent = olMatcher.group(1);
            java.util.regex.Pattern liPattern = java.util.regex.Pattern.compile("(?is)<li[^>]*>(.*?)</li>");
            java.util.regex.Matcher liMatcher = liPattern.matcher(olContent);
            StringBuilder numberedList = new StringBuilder();
            int count = 1;
            while (liMatcher.find()) {
                String liText = stripTagsAndEntities(liMatcher.group(1)).trim();
                if (!liText.isEmpty()) {
                    numberedList.append(count++).append(". ").append(liText).append("\n");
                }
            }
            olMatcher.appendReplacement(sb, java.util.regex.Matcher.quoteReplacement(numberedList.toString()));
        }
        olMatcher.appendTail(sb);
        text = sb.toString();

        // 2. Process Unordered Lists <ul>...</ul> -> • item
        java.util.regex.Pattern ulPattern = java.util.regex.Pattern.compile("(?is)<ul[^>]*>(.*?)</ul>");
        java.util.regex.Matcher ulMatcher = ulPattern.matcher(text);
        sb = new StringBuilder();
        while (ulMatcher.find()) {
            String ulContent = ulMatcher.group(1);
            java.util.regex.Pattern liPattern = java.util.regex.Pattern.compile("(?is)<li[^>]*>(.*?)</li>");
            java.util.regex.Matcher liMatcher = liPattern.matcher(ulContent);
            StringBuilder bulletList = new StringBuilder();
            while (liMatcher.find()) {
                String liText = stripTagsAndEntities(liMatcher.group(1)).trim();
                if (!liText.isEmpty()) {
                    bulletList.append("• ").append(liText).append("\n");
                }
            }
            ulMatcher.appendReplacement(sb, java.util.regex.Matcher.quoteReplacement(bulletList.toString()));
        }
        ulMatcher.appendTail(sb);
        text = sb.toString();

        // 3. Process remaining <p>, <br>, <div>, <tr> -> newline
        text = text.replaceAll("(?i)<br\\s*/?>", "\n");
        text = text.replaceAll("(?i)</(p|div|tr|h[1-6])>", "\n");

        // 4. Strip remaining HTML tags and decode entities
        text = stripTagsAndEntities(text);

        // 5. Clean up extra whitespace and blank lines
        String[] lines = text.split("\r?\n");
        StringBuilder cleaned = new StringBuilder();
        for (String line : lines) {
            String trimmedLine = line.trim();
            if (!trimmedLine.isEmpty()) {
                if (cleaned.length() > 0) {
                    cleaned.append("\n");
                }
                cleaned.append(trimmedLine);
            }
        }

        String result = cleaned.toString().trim();
        return result.isEmpty() ? "-" : result;
    }

    /**
     * จัดรูปแบบหัวข้อและเนื้อหาให้อยู่ในบล็อกเดียวกันแบบ styled text
     * ป้องกันปัญหาหัวข้อถูกตัดแยกหน้าจากเนื้อหา (Orphan Header)
     */
    public static String formatSection(String title, String rawHtml) {
        String content = htmlToPlainText(rawHtml);
        String safeTitle = escapeXml(title);
        String safeContent = escapeXml(content);
        return "<style isBold=\"true\">" + safeTitle + "</style>\n" + safeContent;
    }

    private static String escapeXml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;");
    }

    private static String stripTagsAndEntities(String input) {
        if (input == null) return "";
        String s = input.replaceAll("<[^>]+>", "");
        s = s.replace("&nbsp;", " ")
             .replace("&amp;", "&")
             .replace("&lt;", "<")
             .replace("&gt;", ">")
             .replace("&quot;", "\"")
             .replace("&#39;", "'");
        return s;
    }
}
