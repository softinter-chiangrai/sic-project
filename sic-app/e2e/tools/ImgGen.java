import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.GradientPaint;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.File;

/**
 * Writes a test picture in a format Node cannot encode without libraries (jpg, gif, bmp, or png with transparency).
 * Run: java ImgGen.java <jpg|gif|bmp|png-alpha> <width> <height> <outFile>
 */
public class ImgGen {
    public static void main(String[] a) throws Exception {
        String fmt = a[0];
        int w = Integer.parseInt(a[1]);
        int h = Integer.parseInt(a[2]);
        boolean alpha = fmt.equals("png-alpha");
        BufferedImage img = new BufferedImage(w, h, alpha ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setPaint(new GradientPaint(0, 0, new Color(30, 90, 200), w, h, new Color(240, 200, 40)));
        g.fillRect(0, 0, w, h);
        if (alpha) {
            g.setComposite(java.awt.AlphaComposite.Clear);
            g.fillRect(w / 4, h / 4, w / 2, h / 2); // transparent hole
        }
        g.dispose();
        ImageIO.write(img, alpha ? "png" : fmt, new File(a[3]));
    }
}
