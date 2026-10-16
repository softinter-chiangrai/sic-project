package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.service.PmCustomerProjectExportService;
import com.softinter.sicapi.service.ReportServiceClient;
import com.softinter.sicapi.util.PdfBook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.util.*;

/**
 * Print of the documents ticked in a list page: one PDF as it prints alone, several as one book (table of contents and
 * running page numbers, PdfBook). Documents of another business are left out.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BulkDocumentExportService {

    public static final int MAX_DOCUMENTS = 200;

    private final DataSource dataSource;
    private final DocumentPdfExporters exporters;
    private final PmCustomerProjectExportService projectExport;

    public record Result(byte[] bytes, String fileName) {
    }

    private static final String PROJECT_LABELS = "SELECT id, COALESCE(project_code, '') || ' ' || COALESCE(project_name, '') "
            + "FROM pm_customer_project WHERE id = ANY(?) AND is_delete = false AND business_id = ?";

    private static final Map<String, String[]> TITLES = Map.ofEntries(
            Map.entry("project", new String[]{"โครงการ", "Projects"}),
            Map.entry("contract", new String[]{"สัญญา", "Contracts"}),
            Map.entry("requirement", new String[]{"ความต้องการ (Requirements)", "Requirements"}),
            Map.entry("specification", new String[]{"ข้อกำหนดเชิงเทคนิค (Specifications)", "Specifications"}),
            Map.entry("design-review", new String[]{"การตรวจทานแบบ (Design Reviews)", "Design Reviews"}),
            Map.entry("user-manual", new String[]{"คู่มือการใช้งาน (User Manuals)", "User Manuals"}),
            Map.entry("delivery", new String[]{"การส่งมอบ (Deliveries)", "Deliveries"}),
            Map.entry("invoice", new String[]{"ใบแจ้งหนี้ (Invoices)", "Invoices"}),
            Map.entry("ma-ticket", new String[]{"ตั๋วแจ้งปัญหา MA (MA Tickets)", "MA Tickets"}),
            Map.entry("change-request", new String[]{"คำขอเปลี่ยนแปลง (Change Requests)", "Change Requests"}),
            Map.entry("test-scenario", new String[]{"ผลการทดสอบ (Test Scenarios)", "Test Results (Scenarios)"}));

    public boolean supports(String kind) {
        return TITLES.containsKey(kind);
    }

    public Result export(String kind, List<UUID> ids, UUID businessId, String lang) throws Exception {
        if (!supports(kind)) throw new IllegalArgumentException("Unknown document type: " + kind);
        if (ids == null || ids.isEmpty()) throw new IllegalArgumentException("กรุณาเลือกเอกสารอย่างน้อย 1 รายการ");
        if (ids.size() > MAX_DOCUMENTS) throw new IllegalArgumentException("เลือกได้ไม่เกิน " + MAX_DOCUMENTS + " รายการต่อครั้ง");
        String normalizedLang = "en".equalsIgnoreCase(lang) ? "en" : "th";
        Map<UUID, String> labels = "project".equals(kind)
                ? DocumentPdfExporters.labels(dataSource, PROJECT_LABELS, new LinkedHashSet<>(ids), businessId)
                : exporters.labels(kind, new LinkedHashSet<>(ids), businessId);
        if (labels.isEmpty()) throw new IllegalArgumentException("ไม่พบเอกสารที่เลือก");

        if (labels.size() == 1) {
            var only = labels.entrySet().iterator().next();
            return new Result(exportOne(kind, only.getKey(), businessId, normalizedLang), fileName(only.getValue()) + ".pdf");
        }
        String title = TITLES.get(kind)["en".equals(normalizedLang) ? 1 : 0];
        return book(kind, labels, businessId, normalizedLang, title);
    }

    private Result book(String kind, Map<UUID, String> labels, UUID businessId, String lang, String title) throws Exception {
        byte[] pdf = ReportServiceClient.inBookMode(() -> {
            List<PdfBook.Entry> entries = new ArrayList<>();
            entries.add(new PdfBook.Entry(title, true, null));
            for (var e : labels.entrySet()) {
                byte[] one = tryExport(kind, e.getKey(), e.getValue(), businessId, lang);
                if (one != null) entries.add(new PdfBook.Entry(e.getValue(), false, one));
            }
            if (entries.size() == 1) throw new IllegalStateException("สร้างเอกสารที่เลือกไม่สำเร็จ");
            String subtitle = ("en".equals(lang) ? "Selected documents: " : "เอกสารที่เลือก: ") + (entries.size() - 1);
            return PdfBook.build(null, entries, null, null, PdfBook.jasperToc(lang, subtitle), lang);
        });
        return new Result(pdf, fileName(title) + ".pdf");
    }

    /** one document that cannot be exported does not stop the others */
    private byte[] tryExport(String kind, UUID id, String label, UUID businessId, String lang) {
        try {
            return exportOne(kind, id, businessId, lang);
        } catch (Exception e) {
            log.warn("Bulk export: skipped {} {}: {}", kind, label, e.getMessage());
            return null;
        }
    }

    private byte[] exportOne(String kind, UUID id, UUID businessId, String lang) {
        return "project".equals(kind) ? projectExport.exportProjectPdf(id, businessId, lang) : exporters.export(kind, id, businessId, lang);
    }

    /** a label as a file name that every OS accepts */
    private static String fileName(String label) {
        String s = label.replaceAll("[\\\\/:*?\"<>|\\r\\n]+", " ").replaceAll("\\s+", " ").trim();
        return s.isEmpty() ? "document" : (s.length() > 120 ? s.substring(0, 120).trim() : s);
    }
}
