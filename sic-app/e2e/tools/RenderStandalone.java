import com.fasterxml.jackson.databind.ObjectMapper;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;

import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.HashMap;
import java.util.Map;

/**
 * Renders one template the way report-service does: compile the JRXML, fill it with a JDBC connection and a map of
 * string parameters, export PDF. Run with a classpath that has Jasper, the PostgreSQL driver and report-service's own
 * resources (fonts) but NOT the sic-spring classes, so a template that needs com.softinter.sicapi.* fails here as it would there.
 *
 * Run: java -cp <jars;report-service/src/main/resources> RenderStandalone.java template.jrxml out.pdf dbName params.json
 * Optional 5th argument: PNG prefix. The database password comes from the PGPW environment variable.
 */
public class RenderStandalone {
    public static void main(String[] a) throws Exception {
        System.setProperty("net.sf.jasperreports.compiler.keep.java.file", "false"); // do not leave generated .java files in the working directory
        Map<String, Object> params = new HashMap<>();
        @SuppressWarnings("unchecked")
        Map<String, Object> given = new ObjectMapper().readValue(new File(a[3]), Map.class);
        params.putAll(given);
        JasperReport report = JasperCompileManager.compileReport(a[0]);
        try (Connection c = DriverManager.getConnection("jdbc:postgresql://localhost:54320/" + a[2], "administrator", System.getenv("PGPW"))) {
            JasperPrint print = JasperFillManager.fillReport(report, params, c);
            JasperExportManager.exportReportToPdfFile(print, a[1]);
            if (a.length > 4) { // optional: one PNG per page, <prefix>-<n>.png
                for (int i = 0; i < print.getPages().size(); i++) {
                    java.awt.image.BufferedImage im = (java.awt.image.BufferedImage) net.sf.jasperreports.engine.JasperPrintManager.printPageToImage(print, i, 1.3f);
                    javax.imageio.ImageIO.write(im, "png", new File(a[4] + "-" + (i + 1) + ".png"));
                }
            }
            System.out.println("OK pages=" + print.getPages().size());
        }
    }
}
