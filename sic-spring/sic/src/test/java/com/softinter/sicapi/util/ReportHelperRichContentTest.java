package com.softinter.sicapi.util;

import org.junit.jupiter.api.Test;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** What the report helper does with Tiptap HTML: wide tables, WebP pictures, pictures inside table cells. */
class ReportHelperRichContentTest {

    private static String pngBase64(int w, int h) throws Exception {
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        ImageIO.write(img, "png", bos);
        return Base64.getEncoder().encodeToString(bos.toByteArray());
    }

    /** an HTML row of n cells named prefix0, prefix1, ... */
    private static String row(String prefix, int n) {
        StringBuilder sb = new StringBuilder("<tr>");
        for (int i = 0; i < n; i++) sb.append("<td><p>").append(prefix).append(i).append("</p></td>");
        return sb.append("</tr>").toString();
    }

    private static List<String> names(String prefix, int n) {
        List<String> out = new ArrayList<>();
        for (int i = 0; i < n; i++) out.add(prefix + i);
        return out;
    }

    // ---- column slices -------------------------------------------------------------------------------------------

    @Test
    void aTableThatFitsTheGridIsNotSliced() {
        List<List<String>> rows = List.of(names("h", 6), names("a", 6));
        List<List<List<String>>> slices = ReportHelper.sliceColumns(rows);
        assertEquals(1, slices.size());
        assertEquals(rows, slices.get(0), "a table of up to 6 columns stays exactly as it was");
    }

    @Test
    void aWideTableIsCutIntoSlicesThatRepeatTheFirstColumn() {
        List<List<String>> rows = List.of(names("h", 9), names("a", 9), names("b", 9));
        List<List<List<String>>> slices = ReportHelper.sliceColumns(rows);
        assertEquals(2, slices.size(), "8 data columns need two slices of 4");
        for (List<List<String>> slice : slices) {
            assertEquals(3, slice.size(), "every slice keeps every row, header included");
            assertEquals(5, slice.get(0).size(), "key column + 4 data columns");
            assertEquals(List.of("h0", "a0", "b0"), slice.stream().map(r -> r.get(0)).toList(), "the first column repeats in every slice");
        }
        assertEquals(List.of("h0", "h1", "h2", "h3", "h4"), slices.get(0).get(0));
        assertEquals(List.of("h0", "h5", "h6", "h7", "h8"), slices.get(1).get(0));
    }

    @Test
    void noColumnIsLostAndNoSliceIsWiderThanTheGrid() {
        for (int columns = 7; columns <= 40; columns++) {
            List<List<String>> rows = List.of(names("h", columns), names("a", columns));
            List<List<List<String>>> slices = ReportHelper.sliceColumns(rows);
            List<String> seen = new ArrayList<>();
            for (List<List<String>> slice : slices) {
                assertTrue(slice.get(0).size() <= ReportHelper.GRID_COLUMNS, columns + " columns: a slice is wider than the grid");
                seen.addAll(slice.get(1).subList(1, slice.get(1).size())); // data cells of the body row, key column left out
            }
            List<String> expected = new ArrayList<>(names("a", columns).subList(1, columns));
            assertEquals(expected, seen, columns + " columns: some column was lost or reordered");
        }
    }

    @Test
    void rowsShorterThanTheTableArePaddedNotDropped() {
        List<List<String>> rows = List.of(names("h", 8), List.of("only"));
        List<List<List<String>>> slices = ReportHelper.sliceColumns(rows);
        assertEquals(2, slices.size());
        assertEquals("only", slices.get(0).get(1).get(0));
        assertEquals("", slices.get(0).get(1).get(1), "missing cells become empty cells");
    }

    @Test
    void everyCellOfAWideTableReachesTheBlocksAndSlicesAreSeparatedByAGap() {
        String html = "<table><tbody>" + row("x", 9) + row("y", 9) + "</tbody></table>";
        List<ReportHelper.ContentBlock> blocks = ReportHelper.extractContentBlocks(html, "");
        long tableRows = blocks.stream().filter(ReportHelper.ContentBlock::isTableRow).count();
        assertEquals(4, tableRows, "2 rows x 2 slices");
        assertEquals(1, blocks.stream().filter(b -> !b.isTableRow()).count(), "one gap between the two slices");
    }

    // ---- pictures ------------------------------------------------------------------------------------------------

    @Test
    void pictureInsideATableCellIsKeptAfterItsRow() throws Exception {
        String img = "<img src=\"data:image/png;base64," + pngBase64(40, 20) + "\">";
        String html = "<table><tbody><tr><td><p>cell</p>" + img + "</td><td><p>other</p></td></tr></tbody></table>";
        List<ReportHelper.ContentBlock> blocks = ReportHelper.extractContentBlocks(html, "");
        assertEquals(2, blocks.size(), "one row, then its picture");
        assertTrue(blocks.get(0).isTableRow());
        assertNotNull(blocks.get(1).getImageData(), "the picture of the cell must not be dropped");
    }

    @Test
    void aRowWithOnlyAPictureDoesNotLeaveAnEmptyTextRow() throws Exception {
        String img = "<img src=\"data:image/png;base64," + pngBase64(40, 20) + "\">";
        List<ReportHelper.ContentBlock> blocks = ReportHelper.extractContentBlocks("<table><tbody><tr><td>" + img + "</td></tr></tbody></table>", "");
        assertEquals(1, blocks.size());
        assertNotNull(blocks.get(0).getImageData());
    }

    @Test
    void picturesOfAWideTableAreKeptAfterTheLastSlice() throws Exception {
        String img = "<img src=\"data:image/png;base64," + pngBase64(40, 20) + "\">";
        String html = "<table><tbody>" + row("h", 8) + "<tr><td>" + img + "</td>" + "<td>b</td>".repeat(7) + "</tr></tbody></table>";
        List<ReportHelper.ContentBlock> blocks = ReportHelper.extractContentBlocks(html, "");
        assertNotNull(blocks.get(blocks.size() - 1).getImageData(), "the picture comes after the slices, not lost");
    }

    @Test
    void webpIsConvertedToPngAndOtherTypesPassThrough() throws Exception {
        // 1x1 lossless WebP
        byte[] webp = Base64.getDecoder().decode("UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==");
        byte[] out = ReportHelper.pdfSafe(webp);
        BufferedImage decoded = ImageIO.read(new ByteArrayInputStream(out));
        assertNotNull(decoded, "the result must be a picture the PDF writer can read (PNG)");
        assertEquals(1, decoded.getWidth());
        assertEquals(0x89, out[0] & 0xFF, "PNG signature");

        byte[] png = Base64.getDecoder().decode(pngBase64(3, 3));
        assertSame(png, ReportHelper.pdfSafe(png), "a PNG is left alone");
    }
}
