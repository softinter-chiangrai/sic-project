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
     * ใช้แทนการส่ง HTML ดิบเข้า markup="html" ตรงๆ (ซึ่งไม่รู้จัก table/img/ul/ol และตัดทิ้งเงียบๆ)
     * สำหรับ field ที่ไม่มีหัวข้อ section แยก (ต่างจาก formatSection ที่ผูกหัวข้อไว้ด้วย) —
     * ใช้คู่กับ List component ต่างหากสำหรับตาราง/รูปที่ดึงออกจาก html เดียวกัน
     */
    public static String plainTextWithoutTables(String rawHtml) {
        return htmlToPlainText(stripTables(rawHtml));
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
     * แปลงรูปฝัง (base64) ทั้งหมดใน html เป็น bean ให้ JasperReports bind เป็น datasource ของ
     * List component ได้ (แถวไม่จำกัดจำนวน ต่างจาก imageStreamAt/hasImageAt แบบเดิมที่จำกัดที่ 4 ช่อง)
     */
    public static List<ImageRow> extractInlineImageRows(String html) {
        List<ImageRow> rows = new ArrayList<>();
        for (byte[] data : extractInlineImages(html)) {
            rows.add(new ImageRow(data));
        }
        return rows;
    }

    /** ความกว้างสูงสุดที่พอดีหน้ากระดาษ (columnWidth 515 หัก padding) */
    private static final int MAX_IMAGE_WIDTH = 513;

    /**
     * ปรับรูปให้กว้าง targetWidth px (0 = ใช้ขนาดจริงของไฟล์) แต่ไม่เกินความกว้างหน้ากระดาษ
     * Jasper แสดง 1px = 1pt จึงได้ขนาดตรงกับที่ผู้ใช้ตั้งไว้ใน tiptap
     */
    static byte[] fitWidth(byte[] src, int targetWidth) {
        try {
            java.awt.image.BufferedImage img = javax.imageio.ImageIO.read(new java.io.ByteArrayInputStream(src));
            if (img == null) return src;
            int w = Math.min(targetWidth > 0 ? targetWidth : img.getWidth(), MAX_IMAGE_WIDTH);
            if (w == img.getWidth()) return src;
            int h = Math.max(1, Math.round(img.getHeight() * (float) w / img.getWidth()));
            java.awt.image.BufferedImage out = new java.awt.image.BufferedImage(w, h, java.awt.image.BufferedImage.TYPE_INT_ARGB);
            java.awt.Graphics2D g = out.createGraphics();
            g.setRenderingHint(java.awt.RenderingHints.KEY_INTERPOLATION, java.awt.RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g.drawImage(img, 0, 0, w, h, null);
            g.dispose();
            java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
            javax.imageio.ImageIO.write(out, "png", bos);
            return bos.toByteArray();
        } catch (Exception e) {
            return src;
        }
    }

    /**
     * แตก HTML ของ tiptap เป็นบล็อกเรียงตามลำดับจริง: ข้อความ, รูป, ข้อความ, ... เพื่อให้รูปอยู่ตำแหน่งเดิม
     * และขนาดตาม attr width ที่ตั้งใน editor (ถ้าไม่มี = ขนาดจริงของไฟล์) ไม่มีเนื้อหาเลย → ใช้ fallback
     */
    public static List<ContentBlock> extractContentBlocks(String html, String fallback) {
        return extractContentBlocks(html, fallback, MAX_IMAGE_WIDTH);
    }

    /** maxWidth = ความกว้าง (pt) ของกล่องเนื้อหาในรายงานนั้น ๆ รูปที่กว้างกว่านี้จะถูกย่อตอนแสดง */
    public static List<ContentBlock> extractContentBlocks(String html, String fallback, int maxWidth) {
        List<ContentBlock> blocks = new ArrayList<>();
        String source = html == null ? "" : html;
        // รูปและตารางเป็นตัวแบ่งบล็อก ข้อความที่เหลือระหว่างกลางเป็นบล็อกข้อความ
        Matcher token = Pattern.compile("(?is)<table[^>]*>.*?</table>|<img\\b[^>]*>").matcher(source);
        int last = 0;
        while (token.find()) {
            addTextBlock(blocks, source.substring(last, token.start()));
            last = token.end();
            String part = token.group();
            if (part.regionMatches(true, 0, "<table", 0, 6)) {
                for (TableRow row : extractTableRows(part)) blocks.add(ContentBlock.table(row));
                continue;
            }
            Matcher src = Pattern.compile("data:image/[^;\"']+;base64,([A-Za-z0-9+/=]+)").matcher(part);
            if (!src.find()) continue;
            try {
                Matcher w = Pattern.compile("(?i)\\swidth=\"(\\d+)\"").matcher(part);
                int width = w.find() ? Integer.parseInt(w.group(1)) : 0;
                // tiptap เก็บการจัดตำแหน่งเป็น text-align (style) หรือ data-align
                Matcher al = Pattern.compile("(?i)(?:text-align:\\s*|data-align=\"?)(left|center|right)").matcher(part);
                blocks.add(ContentBlock.image(scaled(Base64.getDecoder().decode(src.group(1)), width, maxWidth),
                        al.find() ? al.group(1).toLowerCase() : "left"));
            } catch (IllegalArgumentException e) {
                log.warn("Skipping malformed base64 image in report content: {}", e.getMessage());
            }
        }
        addTextBlock(blocks, source.substring(last));
        if (blocks.isEmpty() && fallback != null && !fallback.isEmpty()) blocks.add(ContentBlock.text(fallback));
        return blocks;
    }

    /** ต่อบล็อกข้อความท้ายรายการ (เช่น ชื่อไฟล์แนบ) — null/ว่าง = ไม่ต่อ */
    public static List<ContentBlock> appendText(List<ContentBlock> blocks, String text) {
        if (text != null && !text.isBlank()) blocks.add(ContentBlock.text(text));
        return blocks;
    }

    /** ต่อชื่อไฟล์แนบ (ข้อความ) และรูปในเอกสารแนบของ upload group นั้นท้ายรายการ */
    public static List<ContentBlock> appendAttachments(List<ContentBlock> blocks, String text, Object uploadGroupId) {
        appendText(blocks, text);
        return appendImages(blocks, uploadGroupId);
    }

    /** ต่อรูปในเอกสารแนบของ upload group ท้ายรายการ (ขนาดจริง ย่อเฉพาะที่กว้างเกินหน้า) */
    public static List<ContentBlock> appendImages(List<ContentBlock> blocks, Object uploadGroupId) {
        blocks.addAll(imageBlocks(ReportAttachmentImages.load(uploadGroupId)));
        return blocks;
    }

    /** แปลงไฟล์รูป (เช่น เอกสารแนบ) เป็นบล็อกรูปเรียงต่อกัน ขนาดจริง ย่อเฉพาะที่กว้างเกินหน้ากระดาษ */
    public static List<ContentBlock> imageBlocks(List<byte[]> images) {
        List<ContentBlock> blocks = new ArrayList<>();
        for (byte[] data : images) blocks.add(ContentBlock.image(scaled(data, 0, MAX_IMAGE_WIDTH), "left"));
        return blocks;
    }

    private static void addTextBlock(List<ContentBlock> blocks, String htmlPart) {
        String text = plainTextWithoutTables(htmlPart);
        if (!"-".equals(text)) blocks.add(ContentBlock.text(text));
    }

    /** บล็อกเนื้อหาหนึ่งชิ้น: ข้อความ, รูป หรือแถวตาราง อย่างใดอย่างหนึ่ง */
    public static class ContentBlock {
        private final String text;
        private final net.sf.jasperreports.renderers.Renderable image;
        private final String align;
        private final TableRow row;

        private ContentBlock(String text, net.sf.jasperreports.renderers.Renderable image, String align, TableRow row) {
            this.text = text;
            this.image = image;
            this.align = align;
            this.row = row;
        }

        static ContentBlock text(String text) { return new ContentBlock(text, null, null, null); }
        static ContentBlock image(net.sf.jasperreports.renderers.Renderable image, String align) { return new ContentBlock(null, image, align, null); }
        static ContentBlock table(TableRow row) { return new ContentBlock(null, null, null, row); }

        public String getText() { return text; }
        public String getAlign() { return align; }
        public boolean isTableRow() { return row != null; }

        /** จำนวนคอลัมน์ที่ใช้จริงในแถวนี้ (ตัดคอลัมน์ว่างท้ายแถว) */
        public int getCols() {
            if (row == null) return 0;
            for (int i = 5; i > 0; i--) {
                if (!row.cellAt(i).isEmpty()) return i + 1;
            }
            return 1;
        }
        public String getC1() { return row == null ? null : row.getC1(); }
        public String getC2() { return row == null ? null : row.getC2(); }
        public String getC3() { return row == null ? null : row.getC3(); }
        public String getC4() { return row == null ? null : row.getC4(); }
        public String getC5() { return row == null ? null : row.getC5(); }
        public String getC6() { return row == null ? null : row.getC6(); }

        public net.sf.jasperreports.renderers.Renderable getImageData() {
            return image;
        }
    }

    /**
     * เก็บ pixel เดิมของรูปไว้ครบ (PDF ฝัง bytes ต้นฉบับ ไม่เบลอ) แต่รายงานขนาดที่ใช้แสดงให้ RealHeight
     * จึงย่อรูปกว้างเกินหน้ากระดาษตอนแสดงผลได้โดยไม่ลดความละเอียด
     */
    static class ScaledImageRenderer extends net.sf.jasperreports.renderers.SimpleDataRenderer
            implements net.sf.jasperreports.renderers.DimensionRenderable {
        private final java.awt.geom.Dimension2D size;

        ScaledImageRenderer(byte[] data, int w, int h) {
            super(data, null);
            this.size = new java.awt.Dimension(w, h);
        }

        @Override
        public java.awt.geom.Dimension2D getDimension(net.sf.jasperreports.engine.JasperReportsContext ctx) {
            return size;
        }
    }

    /** targetWidth px (0 = กว้างตามไฟล์) ไม่เกินความกว้างหน้ากระดาษ — ย่อที่ตอนแสดง ไม่แตะ pixel ต้นฉบับ */
    static net.sf.jasperreports.renderers.Renderable scaled(byte[] src, int targetWidth, int maxWidth) {
        try {
            java.awt.image.BufferedImage img = javax.imageio.ImageIO.read(new java.io.ByteArrayInputStream(src));
            if (img == null) return net.sf.jasperreports.renderers.SimpleDataRenderer.getInstance(src);
            int w = Math.min(targetWidth > 0 ? targetWidth : img.getWidth(), maxWidth);
            int h = Math.max(1, Math.round(img.getHeight() * (float) w / img.getWidth()));
            return new ScaledImageRenderer(src, w, h);
        } catch (Exception e) {
            return net.sf.jasperreports.renderers.SimpleDataRenderer.getInstance(src);
        }
    }

    /** Bean รูปภาพหนึ่งรูป ให้ JasperReports bind เป็น datasource ของ List component ได้ */
    public static class ImageRow {
        private final byte[] data;

        public ImageRow(byte[] data) {
            this.data = fitWidth(data, 0);
        }

        public java.io.InputStream getImageData() {
            return new java.io.ByteArrayInputStream(data);
        }
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
