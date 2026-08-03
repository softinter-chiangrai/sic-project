package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.entity.pm.PmRequirement;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;

@Slf4j
@Service
public class RequirementExportService {

    public ByteArrayOutputStream exportToPdf(PmRequirement requirement) {
        // In real implementation, use iText or JasperReports
        // This is a placeholder that returns a simple text PDF
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(outputStream)) {
            writer.println("%PDF-1.4");
            writer.println("1 0 obj");
            writer.println("<< /Type /Catalog /Pages 2 0 R >>");
            writer.println("endobj");
            writer.println("2 0 obj");
            writer.println("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
            writer.println("endobj");
            writer.println("3 0 obj");
            writer.println("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>");
            writer.println("endobj");
            writer.println("4 0 obj");
            writer.println("<< /Length 100 >>");
            writer.println("stream");
            writer.println("BT /F1 24 Tf 50 700 Td (" + requirement.getTitle() + ") Tj ET");
            writer.println("BT /F1 12 Tf 50 660 Td (Code: " + requirement.getRequirementCode() + ") Tj ET");
            writer.println("BT /F1 12 Tf 50 640 Td (Status: " + requirement.getStatus() + ") Tj ET");
            writer.println("endstream");
            writer.println("endobj");
            writer.println("xref");
            writer.println("0 5");
            writer.println("trailer << /Size 5 /Root 1 0 R >>");
            writer.println("startxref");
            writer.println("%%EOF");
            writer.flush();
        }
        return outputStream;
    }

    public ByteArrayOutputStream exportToDocx(PmRequirement requirement) {
        // Placeholder for DOCX export
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        String html = generateHtml(requirement);
        try (PrintWriter writer = new PrintWriter(outputStream)) {
            writer.println("<!DOCTYPE html>");
            writer.println("<html><head><meta charset='UTF-8'><title>" + requirement.getTitle() + "</title></head>");
            writer.println("<body>" + html + "</body></html>");
            writer.flush();
        }
        return outputStream;
    }

    public ByteArrayOutputStream exportToHtml(PmRequirement requirement) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(outputStream)) {
            writer.println(generateHtml(requirement));
            writer.flush();
        }
        return outputStream;
    }

    public byte[] exportWithJasper(PmRequirement requirement, String format) {
        // In real implementation, use JasperReports
        // This is a placeholder
        log.info("Exporting with Jasper: {}", requirement.getId());
        return "<html><body>Jasper Export Placeholder</body></html>".getBytes();
    }

    private String generateHtml(PmRequirement requirement) {
        return """
        <!DOCTYPE html>
        <html>
        <head><meta charset='UTF-8'><title>%s</title></head>
        <body>
          <h1>%s</h1>
          <p><strong>Code:</strong> %s</p>
          <p><strong>Status:</strong> %s</p>
          <p><strong>Priority:</strong> %s</p>
          <div>%s</div>
        </body>
        </html>
        """.formatted(
            requirement.getTitle(),
            requirement.getTitle(),
            requirement.getRequirementCode(),
            requirement.getStatus(),
            requirement.getPriority(),
            requirement.getDescription() != null ? requirement.getDescription() : ""
        );
    }
}