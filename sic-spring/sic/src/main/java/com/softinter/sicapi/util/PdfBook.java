package com.softinter.sicapi.util;

import com.lowagie.text.Document;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfCopy;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.PdfStamper;
import org.springframework.core.io.ClassPathResource;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

/**
 * Joins finished PDFs into one book: head, table of contents, every entry's PDF as it is, tail.
 * Each PDF keeps its own layout. The parts are generated with bookMode=true (ReportServiceClient.inBookMode), so the templates
 * leave out their own page number; the book prints its running number in that spot (bottom right, the same in every SIC
 * template), e.g. "หน้า 12 / 85".
 */
public final class PdfBook {

    /** A row of the table of contents: a group heading (pdf == null) or a document whose pages are added to the book. */
    public record Entry(String title, boolean group, byte[] pdf) {
    }

    // where every SIC template prints its page number: page footer 30pt high above a 40pt bottom margin, field y=8..26,
    // x=380..515 of the 515pt column (40pt left margin) -> 44..62pt from the bottom, 420..555pt from the left
    private static final float NUMBER_RIGHT_INSET = 40f;
    private static final float NUMBER_BASELINE = 48f;
    private static final Color FOOTER_GREY = new Color(0x94, 0xA3, 0xB8);

    private PdfBook() {
    }

    /**
     * @param toc renders the table of contents from rows {title, page, group}; called twice (to learn its length, then with the
     *            real page numbers)
     */
    public static byte[] build(byte[] head, List<Entry> entries, byte[] tail, String tailTitle,
                               Function<List<Map<String, ?>>, byte[]> toc, String lang) throws IOException {
        int headPages = pages(head);
        byte[] tocPdf = toc.apply(rows(entries, tailTitle, tail, headPages, 1));
        int tocPages = pages(tocPdf);
        tocPdf = toc.apply(rows(entries, tailTitle, tail, headPages, tocPages));
        if (pages(tocPdf) != tocPages) { // the real numbers changed its length (practically never): count once more
            tocPages = pages(tocPdf);
            tocPdf = toc.apply(rows(entries, tailTitle, tail, headPages, tocPages));
        }

        List<byte[]> parts = new ArrayList<>();
        parts.add(head);
        parts.add(tocPdf);
        entries.stream().filter(e -> e.pdf() != null).forEach(e -> parts.add(e.pdf()));
        parts.add(tail);
        return stampPageNumbers(merge(parts), lang);
    }

    private static List<Map<String, ?>> rows(List<Entry> entries, String tailTitle, byte[] tail, int headPages, int tocPages) throws IOException {
        List<Map<String, ?>> rows = new ArrayList<>();
        int next = headPages + tocPages + 1;
        for (Entry e : entries) {
            rows.add(row(e.title(), next, e.group()));
            if (e.pdf() != null) {
                next += pages(e.pdf());
            }
        }
        if (tail != null) {
            rows.add(row(tailTitle, next, true));
        }
        return rows;
    }

    private static Map<String, Object> row(String title, int page, boolean group) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("title", title);
        r.put("page", String.valueOf(page));
        r.put("group", group);
        return r;
    }

    public static int pages(byte[] pdf) throws IOException {
        PdfReader r = new PdfReader(pdf);
        try {
            return r.getNumberOfPages();
        } finally {
            r.close();
        }
    }

    private static byte[] merge(List<byte[]> pdfs) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document();
        PdfCopy copy = new PdfCopy(doc, out);
        doc.open();
        for (byte[] pdf : pdfs) {
            if (pdf == null) continue;
            PdfReader r = new PdfReader(pdf);
            for (int i = 1; i <= r.getNumberOfPages(); i++) {
                copy.addPage(copy.getImportedPage(r, i));
            }
            copy.freeReader(r);
            r.close();
        }
        doc.close();
        return out.toByteArray();
    }

    private static byte[] stampPageNumbers(byte[] pdf, String lang) throws IOException {
        BaseFont font;
        try (InputStream in = new ClassPathResource("fonts/THSarabunNew.ttf").getInputStream()) {
            font = BaseFont.createFont("THSarabunNew.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, true, in.readAllBytes(), null);
        }
        String word = "en".equalsIgnoreCase(lang) ? "Page" : "หน้า";
        PdfReader r = new PdfReader(pdf);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfStamper st = new PdfStamper(r, out);
        int total = r.getNumberOfPages();
        for (int i = 1; i <= total; i++) {
            Rectangle page = r.getPageSizeWithRotation(i);
            float right = page.getRight() - NUMBER_RIGHT_INSET;
            PdfContentByte cb = st.getOverContent(i);
            cb.saveState();
            cb.beginText();
            cb.setFontAndSize(font, 11);
            cb.setColorFill(FOOTER_GREY);
            cb.showTextAligned(PdfContentByte.ALIGN_RIGHT, word + " " + i + " / " + total, right, page.getBottom() + NUMBER_BASELINE, 0);
            cb.endText();
            cb.restoreState();
        }
        st.close();
        r.close();
        return out.toByteArray();
    }
}
