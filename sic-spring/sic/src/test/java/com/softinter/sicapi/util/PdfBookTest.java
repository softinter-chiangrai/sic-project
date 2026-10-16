package com.softinter.sicapi.util;

import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.parser.PdfTextExtractor;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PdfBookTest {

    private static byte[] pdf(String text, int pages) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document d = new Document();
        PdfWriter.getInstance(d, out);
        d.open();
        for (int i = 0; i < pages; i++) {
            if (i > 0) d.newPage();
            d.add(new Paragraph(text + " " + (i + 1)));
        }
        d.close();
        return out.toByteArray();
    }

    @Test
    void joinsHeadTocDocumentsAndTailWithRunningPageNumbersAndATocThatPointsAtEachDocument() throws Exception {
        List<List<Map<String, ?>>> tocCalls = new ArrayList<>();
        byte[] book = PdfBook.build(
                pdf("summary", 2),
                List.of(new PdfBook.Entry("Requirements", true, null),
                        new PdfBook.Entry("REQ-001", false, pdf("req one", 3)),
                        new PdfBook.Entry("REQ-002", false, pdf("req two", 1))),
                pdf("sign-off", 1), "Sign-off",
                rows -> {
                    tocCalls.add(rows);
                    try {
                        return pdf("toc", 1);
                    } catch (Exception e) {
                        throw new IllegalStateException(e);
                    }
                }, "en");

        // summary 2 + toc 1 + 3 + 1 + sign-off 1
        assertEquals(8, PdfBook.pages(book));
        List<Map<String, ?>> toc = tocCalls.get(tocCalls.size() - 1);
        assertEquals("4", toc.get(0).get("page"));  // Requirements heading = first page of REQ-001
        assertEquals("4", toc.get(1).get("page"));  // REQ-001
        assertEquals("7", toc.get(2).get("page"));  // REQ-002 after REQ-001's 3 pages
        assertEquals("8", toc.get(3).get("page"));  // sign-off
        assertEquals(Boolean.TRUE, toc.get(3).get("group"));

        PdfTextExtractor text = new PdfTextExtractor(new PdfReader(book));
        assertTrue(text.getTextFromPage(1).contains("Page 1 / 8"), text.getTextFromPage(1));
        assertTrue(text.getTextFromPage(7).contains("req two 1"));
        assertTrue(text.getTextFromPage(7).contains("Page 7 / 8"));
    }
}
