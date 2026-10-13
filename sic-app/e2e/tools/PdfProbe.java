import com.lowagie.text.pdf.PRTokeniser;
import com.lowagie.text.pdf.PdfContentParser;
import com.lowagie.text.pdf.PdfDictionary;
import com.lowagie.text.pdf.PdfName;
import com.lowagie.text.pdf.PdfNumber;
import com.lowagie.text.pdf.PdfObject;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;

/**
 * Reads a PDF and prints one JSON line: page count, every embedded image as "WxH" (pixels), where each image is drawn
 * (page, x, y, width, height in points, origin bottom-left) and the text of each page.
 * Used by the Playwright report tests to prove that pictures and tables really reach the exported document,
 * and that they keep their size and alignment on the page.
 * Run: java -cp openpdf.jar PdfProbe.java file.pdf
 */
public class PdfProbe {
    public static void main(String[] args) throws Exception {
        PdfReader reader = new PdfReader(args[0]);
        StringBuilder images = new StringBuilder();
        for (int i = 1; i < reader.getXrefSize(); i++) {
            PdfObject o = reader.getPdfObject(i);
            if (o == null || !o.isStream()) continue;
            PdfDictionary d = (PdfDictionary) o;
            if (!PdfName.IMAGE.equals(d.get(PdfName.SUBTYPE))) continue;
            String size = size(d);
            if (size == null) continue;
            if (images.length() > 0) images.append(',');
            images.append('"').append(size).append('"');
        }

        StringBuilder placed = new StringBuilder();
        for (int p = 1; p <= reader.getNumberOfPages(); p++) {
            PdfDictionary res = (PdfDictionary) PdfReader.getPdfObject(reader.getPageN(p).get(PdfName.RESOURCES));
            PdfDictionary xo = res == null ? null : res.getAsDict(PdfName.XOBJECT);
            if (xo == null) continue;
            Deque<double[]> stack = new ArrayDeque<>();
            double[] ctm = {1, 0, 0, 1, 0, 0};
            PdfContentParser ps = new PdfContentParser(new PRTokeniser(reader.getPageContent(p)));
            ArrayList<PdfObject> ops = new ArrayList<>();
            while (ps.parse(ops).size() > 0) {
                String op = ops.get(ops.size() - 1).toString();
                if (op.equals("q")) {
                    stack.push(ctm.clone());
                } else if (op.equals("Q")) {
                    if (!stack.isEmpty()) ctm = stack.pop();
                } else if (op.equals("cm") && ops.size() >= 7) {
                    double[] m = new double[6];
                    for (int k = 0; k < 6; k++) m[k] = ((PdfNumber) ops.get(k)).doubleValue();
                    ctm = multiply(m, ctm);
                } else if (op.equals("Do") && ops.size() >= 2) {
                    PdfObject ref = xo.get((PdfName) ops.get(0));
                    PdfObject target = PdfReader.getPdfObject(ref);
                    if (target == null || !target.isStream()) continue;
                    PdfDictionary d = (PdfDictionary) target;
                    if (!PdfName.IMAGE.equals(d.get(PdfName.SUBTYPE))) continue;
                    if (placed.length() > 0) placed.append(',');
                    placed.append("{\"page\":").append(p).append(",\"size\":\"").append(size(d)).append("\",\"x\":").append(num(ctm[4]))
                          .append(",\"y\":").append(num(ctm[5])).append(",\"w\":").append(num(ctm[0])).append(",\"h\":").append(num(ctm[3])).append('}');
                }
            }
        }

        PdfTextExtractor ex = new PdfTextExtractor(reader);
        StringBuilder pages = new StringBuilder();
        for (int p = 1; p <= reader.getNumberOfPages(); p++) {
            if (p > 1) pages.append(',');
            pages.append('"').append(esc(ex.getTextFromPage(p))).append('"');
        }
        System.out.println("{\"pageCount\":" + reader.getNumberOfPages() + ",\"images\":[" + images + "],\"placed\":[" + placed + "],\"pages\":[" + pages + "]}");
    }

    private static String size(PdfDictionary d) {
        PdfNumber w = (PdfNumber) PdfReader.getPdfObject(d.get(PdfName.WIDTH));
        PdfNumber h = (PdfNumber) PdfReader.getPdfObject(d.get(PdfName.HEIGHT));
        return w == null || h == null ? null : w.intValue() + "x" + h.intValue();
    }

    private static String num(double v) {
        return String.format(java.util.Locale.ROOT, "%.2f", v);
    }

    /** result = m x ctm (PDF row-vector convention: the newest cm applies first). */
    private static double[] multiply(double[] m, double[] c) {
        return new double[]{
            m[0] * c[0] + m[1] * c[2], m[0] * c[1] + m[1] * c[3],
            m[2] * c[0] + m[3] * c[2], m[2] * c[1] + m[3] * c[3],
            m[4] * c[0] + m[5] * c[2] + c[4], m[4] * c[1] + m[5] * c[3] + c[5]};
    }

    private static final char QUOTE = 34;
    private static final char BACKSLASH = 92;

    private static String esc(String s) {
        StringBuilder b = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (c == QUOTE || c == BACKSLASH) b.append(BACKSLASH).append(c);
            else if (c == 10) b.append(BACKSLASH).append('n');
            else if (c < 32) b.append(' ');
            else b.append(c);
        }
        return b.toString();
    }
}
