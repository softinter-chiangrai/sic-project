package com.softinter.sicapi.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
public class ReportHelper {

    private static final String LOGO_PATH = "images/softinter_logo.png";

    private ReportHelper() {}

    /**
     * Resolve and normalize language parameter ('th' or 'en')
     */
    public static String resolveLang(String lang, String headerLang) {
        if (lang != null && !lang.trim().isEmpty()) {
            return lang.trim().equalsIgnoreCase("en") ? "en" : "th";
        }
        if (headerLang != null && !headerLang.trim().isEmpty()) {
            return headerLang.trim().equalsIgnoreCase("en") ? "en" : "th";
        }
        return "th";
    }

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
        String content = htmlToPlainText(stripTables(rawHtml));
        String safeTitle = escapeXml(title);
        String safeContent = escapeXml(content);
        return "<style isBold=\"true\">" + safeTitle + "</style>\n" + safeContent;
    }

    /**
     * ตัด &lt;table&gt;...&lt;/table&gt; ออกจาก HTML เพื่อไม่ให้เนื้อหาตารางถูกดึงไปแสดงปนกับ
     * ข้อความธรรมดา (ตารางจะถูกแยกไปเรนเดอร์เป็นกริดจริงต่างหากผ่าน {@link #extractTableRows(String)})
     */
    private static String stripTables(String html) {
        if (html == null) return null;
        return html.replaceAll("(?is)<table[^>]*>.*?</table>", "");
    }

    /**
     * ดึงรูปภาพที่ฝังแบบ base64 (data URI) จาก HTML ของ tiptap ออกมาเป็น byte[] ทีละรูป
     * ใช้กับ field ที่ผู้ใช้แปะรูปเข้า rich text editor โดยตรง (ไม่ได้ผ่านระบบ upload แยก)
     */
    public static List<byte[]> extractInlineImages(String html) {
        List<byte[]> images = new ArrayList<>();
        if (html == null || html.isBlank()) return images;
        Matcher m = Pattern.compile("data:image/[^;\"']+;base64,([A-Za-z0-9+/=]+)").matcher(html);
        while (m.find()) {
            try {
                images.add(Base64.getDecoder().decode(m.group(1)));
            } catch (IllegalArgumentException e) {
                log.warn("Skipping malformed base64 image in report content: {}", e.getMessage());
            }
        }
        return images;
    }

    /**
     * แตกตาราง HTML (จาก tiptap) ให้เป็นรายการแถว/คอลัมน์ (สูงสุด 6 คอลัมน์ต่อแถว) เพื่อนำไปเรนเดอร์
     * เป็นกริดตารางจริงใน Jasper ผ่าน List component (ไม่ใช่ plain text คั่นด้วย separator)
     */
    public static List<TableRow> extractTableRows(String html) {
        List<TableRow> rows = new ArrayList<>();
        if (html == null || html.isBlank()) return rows;

        Matcher tableMatcher = Pattern.compile("(?is)<table[^>]*>(.*?)</table>").matcher(html);
        Pattern rowPattern = Pattern.compile("(?is)<tr[^>]*>(.*?)</tr>");
        Pattern cellPattern = Pattern.compile("(?is)<t[dh][^>]*>(.*?)</t[dh]>");

        while (tableMatcher.find()) {
            Matcher rowMatcher = rowPattern.matcher(tableMatcher.group(1));
            while (rowMatcher.find()) {
                Matcher cellMatcher = cellPattern.matcher(rowMatcher.group(1));
                List<String> cells = new ArrayList<>();
                while (cellMatcher.find()) {
                    cells.add(stripTagsAndEntities(cellMatcher.group(1)).trim());
                }
                if (!cells.isEmpty()) {
                    rows.add(new TableRow(cells));
                }
            }
        }
        return rows;
    }

    /**
     * ใช้คู่กับ printWhenExpression ใน jrxml: บอกว่าตารางใน html มีแถวที่ rowIndex อยู่จริงไหม
     * (ช่องกริดที่ตั้งไว้ล่วงหน้าเกินจำนวนแถวจริงจะถูกซ่อนไปเลย ไม่ใช่โชว์ว่างๆ)
     */
    public static boolean hasTableRow(String html, int rowIndex) {
        return rowIndex < extractTableRows(html).size();
    }

    /** ข้อความในเซลล์ (rowIndex, colIndex) ของตารางแรกใน html คืนค่าว่างถ้าไม่มีจริง (colIndex 0-5) */
    public static String tableCell(String html, int rowIndex, int colIndex) {
        List<TableRow> rows = extractTableRows(html);
        if (rowIndex < 0 || rowIndex >= rows.size()) return "";
        return rows.get(rowIndex).cellAt(colIndex);
    }

    /** ใช้คู่กับ printWhenExpression: บอกว่ามีรูปฝัง (base64) ลำดับที่ index ใน html ไหม */
    public static boolean hasImageAt(String html, int index) {
        return index < extractInlineImages(html).size();
    }

    /** InputStream ของรูปฝังลำดับที่ index (สำหรับ element kind="image" ใน jrxml) หรือ null ถ้าไม่มี */
    public static java.io.InputStream imageStreamAt(String html, int index) {
        List<byte[]> images = extractInlineImages(html);
        if (index < 0 || index >= images.size()) return null;
        return new java.io.ByteArrayInputStream(images.get(index));
    }

    /** Bean แถวตาราง (สูงสุด 6 คอลัมน์) ให้ JasperReports bind เป็น datasource ของ List component ได้ */
    public static class TableRow {
        private final String c1;
        private final String c2;
        private final String c3;
        private final String c4;
        private final String c5;
        private final String c6;

        public TableRow(List<String> cells) {
            this.c1 = cellAt(cells, 0);
            this.c2 = cellAt(cells, 1);
            this.c3 = cellAt(cells, 2);
            this.c4 = cellAt(cells, 3);
            this.c5 = cellAt(cells, 4);
            this.c6 = cellAt(cells, 5);
        }

        private static String cellAt(List<String> cells, int index) {
            return index < cells.size() ? cells.get(index) : "";
        }

        public String getC1() { return c1; }
        public String getC2() { return c2; }
        public String getC3() { return c3; }
        public String getC4() { return c4; }
        public String getC5() { return c5; }
        public String getC6() { return c6; }

        public String cellAt(int colIndex) {
            return switch (colIndex) {
                case 0 -> c1;
                case 1 -> c2;
                case 2 -> c3;
                case 3 -> c4;
                case 4 -> c5;
                case 5 -> c6;
                default -> "";
            };
        }
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
