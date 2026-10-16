package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.exception.GlobalExceptionHandler;
import com.softinter.sicapi.util.ReportHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.InputStream;
import java.sql.*;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Live preview of a document form: the real Jasper PDF of the values in the form, saved or not, and nothing is stored.
 * The form's values (and its child rows) are written to the document's table inside a transaction, the report is filled from
 * that same connection, and the transaction is rolled back. Form keys map to columns by name (camelCase -> snake_case) using
 * the column types of the database, so a new field needs no code here.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentLivePreviewService {

    private final DataSource dataSource;

    private record Child(String key, String table, String fk) {
    }

    /** paramSql: header values that the export service computes in Java for this template; "?" is the document id */
    private record Kind(String table, String template, String idParam, List<Child> children, String paramSql) {
    }

    private static final String DELIVERY_PARAMS = """
            SELECT COALESCE(d.delivery_code, '-') AS "deliveryCode", COALESCE(d.delivery_title, '-') AS "deliveryTitle",
                   COALESCE(p.project_name, '-') AS "projectName", COALESCE(c.contract_no, '-') AS "contractNo",
                   COALESCE(d.delivery_type, 'FINAL') AS "deliveryType", pm_current_version_label('DELIVERY', d.id) AS "deliveryVersion",
                   COALESCE(to_char(d.delivery_date, 'DD/MM/YYYY'), '-') AS "deliveryDate", COALESCE(d.status, '-') AS "status",
                   d.delivery_summary AS "deliverySummary", d.release_note AS "releaseNote",
                   COALESCE(pm_attachment_names(d.attachment_group_id), '') AS "attachmentNames"
              FROM pm_delivery d
              LEFT JOIN pm_customer_project p ON p.id = d.project_id
              LEFT JOIN pm_customer_contract c ON c.id = d.contract_id
             WHERE d.id = ?""";

    private static final String INVOICE_PARAMS = """
            SELECT COALESCE(i.invoice_no, '-') AS "invoiceNo", pm_current_version_label('INVOICE', i.id) AS "docVersion",
                   COALESCE(cu.company_name_local, cu.company_name_en, '-') AS "customerName",
                   COALESCE(p.project_name, '-') AS "projectName", COALESCE(c.contract_no, '-') AS "contractNo",
                   COALESCE(i.billing_type, 'MILESTONE') AS "billingType",
                   COALESCE(to_char(i.issue_date, 'DD/MM/YYYY'), '-') AS "issueDate", COALESCE(to_char(i.due_date, 'DD/MM/YYYY'), '-') AS "dueDate",
                   COALESCE(i.payment_status, 'UNPAID') AS "paymentStatus",
                   to_char(COALESCE(i.subtotal_amount, 0), 'FM999,999,999,990.00') AS "subtotalAmount",
                   COALESCE(i.vat_rate::text, '7.00') AS "vatRate",
                   to_char(COALESCE(i.vat_amount, 0), 'FM999,999,999,990.00') AS "vatAmount",
                   to_char(COALESCE(i.total_amount, 0), 'FM999,999,999,990.00') AS "totalAmount",
                   COALESCE(NULLIF(btrim(i.remark), ''), 'กรุณาโอนเงินเข้าบัญชีบริษัท ซอฟต์อินเตอร์ จำกัด และส่งหลักฐานการชำระเงินเพื่อออกใบเสร็จรับเงิน') AS "remark",
                   COALESCE(pm_attachment_names(i.attachment_group_id), '') AS "attachmentNames"
              FROM pm_invoice i
              LEFT JOIN pm_customer cu ON cu.id = i.customer_id
              LEFT JOIN pm_customer_project p ON p.id = i.project_id
              LEFT JOIN pm_customer_contract c ON c.id = i.contract_id
             WHERE i.id = ?""";

    private static final String MANUAL_PARAMS = """
            SELECT COALESCE(m.manual_code, '-') AS "manualCode", COALESCE(m.manual_title, '-') AS "manualTitle",
                   COALESCE(p.project_name, '-') AS "projectName",
                   CASE upper(COALESCE(m.manual_type, ''))
                       WHEN '' THEN 'User Manual'
                       WHEN 'USER' THEN 'User Manual (คู่มือผู้ใช้งานทั่วไป)'
                       WHEN 'ADMIN' THEN 'Admin Manual (คู่มือผู้ดูแลระบบ)'
                       WHEN 'INSTALLATION' THEN 'Installation Manual (คู่มือการติดตั้ง)'
                       WHEN 'OPERATION' THEN 'Operation Manual (คู่มือการปฏิบัติงาน)'
                       WHEN 'TROUBLESHOOT' THEN 'Troubleshooting Guide (คู่มือแก้ปัญหา)'
                       ELSE m.manual_type END AS "manualType",
                   pm_current_version_label('USER_MANUAL', m.id) AS "version", COALESCE(m.status, '-') AS "status",
                   COALESCE(d.delivery_code, '-') AS "deliveryCode", COALESCE(pm_attachment_names(m.attachment_group_id), '') AS "attachmentNames"
              FROM pm_user_manual m
              LEFT JOIN pm_customer_project p ON p.id = m.project_id
              LEFT JOIN pm_delivery d ON d.id = m.delivery_id
             WHERE m.id = ?""";

    private static final Map<String, Kind> KINDS = Map.of(
            "requirement", new Kind("pm_requirement", "requirement_report", "requirementId", List.of(), null),
            "specification", new Kind("pm_specification", "specification_report", "specificationId", List.of(), null),
            "contract", new Kind("pm_customer_contract", "contract_report", "contractId", List.of(), null),
            "design-review", new Kind("pm_design_review", "design_review_report", "designReviewId", List.of(), null),
            "change-request", new Kind("pm_change_request", "change_request_report", "changeRequestId", List.of(), null),
            "ma-ticket", new Kind("pm_ma_ticket", "ticket_report", "ticketId", List.of(), null),
            "delivery", new Kind("pm_delivery", "delivery_report", "deliveryId",
                    List.of(new Child("items", "pm_delivery_item", "delivery_id"), new Child("checklists", "pm_delivery_checklist", "delivery_id")),
                    DELIVERY_PARAMS),
            "user-manual", new Kind("pm_user_manual", "user_manual_report", "manualId",
                    List.of(new Child("sections", "pm_user_manual_section", "manual_id")), MANUAL_PARAMS),
            "invoice", new Kind("pm_invoice", "invoice_report", "invoiceId",
                    List.of(new Child("items", "pm_invoice_item", "invoice_id")), INVOICE_PARAMS));

    /** columns the form never writes */
    private static final Set<String> PROTECTED = Set.of("id", "business_id", "created_by", "created_date", "updated_by",
            "updated_date", "is_delete", "delete_by", "delete_date", "row_version");
    private static final Set<String> TEXT_TYPES = Set.of("varchar", "text", "bpchar");
    private static final Set<String> UNMAPPED_TYPES = Set.of("json", "jsonb", "bytea");
    private static final ZoneId BANGKOK = ZoneId.of("Asia/Bangkok");
    private static final DateTimeFormatter EXPORT_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(BANGKOK);

    private record Column(String type, boolean required) {
    }

    private final Map<String, Map<String, Column>> columns = new ConcurrentHashMap<>();
    private final Map<String, JasperReport> reports = new ConcurrentHashMap<>();

    public boolean supports(String kind) {
        return KINDS.containsKey(kind);
    }

    public byte[] preview(String kindName, Map<String, Object> form, UUID businessId, String userId, String lang) {
        Kind kind = KINDS.get(kindName);
        if (kind == null) {
            throw new IllegalArgumentException("Unknown document type: " + kindName);
        }
        String normalizedLang = "en".equalsIgnoreCase(lang) ? "en" : "th";
        try (Connection conn = dataSource.getConnection()) {
            boolean autoCommit = conn.getAutoCommit();
            conn.setAutoCommit(false);
            try {
                UUID id = writeDocument(conn, kind.table(), form, businessId, userId);
                for (Child child : kind.children()) {
                    if (form.get(child.key()) instanceof List<?> rows) {
                        writeChildren(conn, child, rows, id, businessId, userId);
                    }
                }
                Map<String, Object> params = new HashMap<>();
                params.put(kind.idParam(), id.toString());
                params.put("businessId", businessId.toString());
                params.put("exportDate", EXPORT_DATE.format(Instant.now()));
                params.put("lang", normalizedLang);
                params.put(JRParameter.REPORT_LOCALE, "en".equals(normalizedLang) ? Locale.ENGLISH : new Locale("th", "TH"));
                params.put("logoStream", ReportHelper.getLogoInputStream());
                if (kind.paramSql() != null) {
                    params.putAll(row(conn, kind.paramSql(), id));
                }
                return JasperExportManager.exportReportToPdf(JasperFillManager.fillReport(report(kind.template()), params, conn));
            } finally {
                conn.rollback(); // nothing of the preview is stored
                conn.setAutoCommit(autoCommit);
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Live preview of {} failed: {}", kindName, e.getMessage(), e);
            throw new RuntimeException("สร้างตัวอย่างเอกสารไม่สำเร็จ: " + e.getMessage(), e);
        }
    }

    /** UPDATE the saved document with the form's values, or INSERT a temporary row for a form never saved; returns the id */
    private UUID writeDocument(Connection conn, String table, Map<String, Object> form, UUID businessId, String userId) throws Exception {
        Map<String, Column> cols = columns(conn, table);
        if (cols.containsKey("project_id")) {
            requireOwnProject(conn, form.get("projectId"), businessId);
        }
        UUID id = asUuid(form.get("id"));
        Map<String, Object> values = mapped(cols, form);
        if (id != null && ownRowExists(conn, table, cols, id, businessId)) {
            List<String> sets = new ArrayList<>();
            List<Object[]> binds = new ArrayList<>();
            values.forEach((col, v) -> {
                if (v != null || !cols.get(col).required()) {
                    sets.add(col + " = CAST(? AS " + cols.get(col).type() + ")");
                    binds.add(new Object[]{v});
                }
            });
            if (!sets.isEmpty()) {
                try (PreparedStatement ps = conn.prepareStatement("UPDATE " + table + " SET " + String.join(", ", sets) + " WHERE id = ?")) {
                    int i = 1;
                    for (Object[] b : binds) ps.setObject(i++, b[0]);
                    ps.setObject(i, id);
                    ps.executeUpdate();
                }
            }
            return id;
        }
        id = UUID.randomUUID();
        insert(conn, table, cols, values, id, businessId, userId);
        return id;
    }

    private void writeChildren(Connection conn, Child child, List<?> rows, UUID parentId, UUID businessId, String userId) throws Exception {
        Map<String, Column> cols = columns(conn, child.table());
        try (PreparedStatement ps = conn.prepareStatement("DELETE FROM " + child.table() + " WHERE " + child.fk() + " = ?")) {
            ps.setObject(1, parentId);
            ps.executeUpdate();
        }
        int order = 0;
        for (Object r : rows) {
            if (!(r instanceof Map<?, ?> m)) continue;
            @SuppressWarnings("unchecked")
            Map<String, Object> values = mapped(cols, (Map<String, Object>) m);
            values.put(child.fk(), parentId.toString());
            if (cols.containsKey("sort_order") && values.get("sort_order") == null) values.put("sort_order", String.valueOf(order));
            order++;
            Savepoint sp = conn.setSavepoint();
            try {
                insert(conn, child.table(), cols, values, UUID.randomUUID(), businessId, userId);
            } catch (Exception e) {
                conn.rollback(sp); // a half-filled row the user is still typing is left out of the preview
                log.debug("Live preview: skipped a {} row: {}", child.table(), e.getMessage());
            }
        }
    }

    private void insert(Connection conn, String table, Map<String, Column> cols, Map<String, Object> values, UUID id, UUID businessId, String userId) throws Exception {
        Map<String, Object> all = new LinkedHashMap<>(values);
        all.values().removeIf(Objects::isNull);
        all.put("id", id.toString());
        if (cols.containsKey("business_id")) all.put("business_id", businessId.toString());
        for (String c : List.of("created_by", "updated_by")) if (cols.containsKey(c)) all.put(c, userId != null ? userId : "system");
        for (String c : List.of("created_date", "updated_date")) if (cols.containsKey(c)) all.put(c, OffsetDateTime.now().toString());
        if (cols.containsKey("is_delete")) all.put("is_delete", "false");
        // required columns the form left empty: text gets "-", anything else has to be filled in first
        for (var e : cols.entrySet()) {
            if (e.getValue().required() && !all.containsKey(e.getKey())) {
                if (!TEXT_TYPES.contains(e.getValue().type())) {
                    throw new IllegalArgumentException("กรุณาระบุ " + GlobalExceptionHandler.fieldLabel(e.getKey()) + " ก่อนดูตัวอย่างเอกสาร");
                }
                all.put(e.getKey(), "-");
            }
        }
        List<String> names = new ArrayList<>(all.keySet());
        String sql = "INSERT INTO " + table + " (" + String.join(", ", names) + ") VALUES ("
                + String.join(", ", names.stream().map(n -> "CAST(? AS " + cols.get(n).type() + ")").toList()) + ")";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            int i = 1;
            for (String n : names) ps.setObject(i++, all.get(n));
            ps.executeUpdate();
        }
    }

    /** form keys that are columns of the table, as text the database casts to the column's type */
    private static Map<String, Object> mapped(Map<String, Column> cols, Map<String, Object> form) {
        Map<String, Object> out = new LinkedHashMap<>();
        form.forEach((key, v) -> {
            String col = key.replaceAll("([a-z0-9])([A-Z])", "$1_$2").toLowerCase(Locale.ROOT);
            Column c = cols.get(col);
            if (c == null || PROTECTED.contains(col) || UNMAPPED_TYPES.contains(c.type()) || v instanceof Map || v instanceof Collection) return;
            out.put(col, toDbText(c.type(), v));
        });
        return out;
    }

    private static Object toDbText(String type, Object v) {
        if (v == null) return null;
        String s = String.valueOf(v);
        if (s.isBlank() && !TEXT_TYPES.contains(type)) return null;
        // sic-datepicker sends the picked day as midnight Bangkok in UTC ("2026-10-15T17:00:00.000Z" = 16 Oct)
        if ("date".equals(type) && s.contains("T")) {
            try {
                return OffsetDateTime.parse(s).atZoneSameInstant(BANGKOK).toLocalDate().toString();
            } catch (Exception ignored) {
                return s.substring(0, 10);
            }
        }
        return s;
    }

    private Map<String, Column> columns(Connection conn, String table) throws SQLException {
        Map<String, Column> cached = columns.get(table);
        if (cached != null) return cached;
        Map<String, Column> cols = new HashMap<>();
        try (PreparedStatement ps = conn.prepareStatement(
                "SELECT column_name, udt_name, is_nullable = 'NO' AND column_default IS NULL FROM information_schema.columns "
                        + "WHERE table_schema = 'public' AND table_name = ?")) {
            ps.setString(1, table);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) cols.put(rs.getString(1), new Column(rs.getString(2), rs.getBoolean(3)));
            }
        }
        columns.put(table, cols);
        return cols;
    }

    private static void requireOwnProject(Connection conn, Object projectId, UUID businessId) throws SQLException {
        UUID pid = asUuid(projectId);
        if (pid == null) {
            throw new IllegalArgumentException("กรุณาเลือกโครงการก่อนดูตัวอย่างเอกสาร");
        }
        try (PreparedStatement ps = conn.prepareStatement("SELECT 1 FROM pm_customer_project WHERE id = ? AND business_id = ? AND is_delete = false")) {
            ps.setObject(1, pid);
            ps.setObject(2, businessId);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) throw new IllegalArgumentException("ไม่พบโครงการนี้ในธุรกิจของคุณ");
            }
        }
    }

    /** the saved row exists and belongs to this business (directly, or through its project) */
    private static boolean ownRowExists(Connection conn, String table, Map<String, Column> cols, UUID id, UUID businessId) throws SQLException {
        String owner = cols.containsKey("business_id") ? "business_id = ?"
                : "project_id IN (SELECT p.id FROM pm_customer_project p WHERE p.business_id = ?)";
        try (PreparedStatement ps = conn.prepareStatement("SELECT 1 FROM " + table + " WHERE id = ? AND " + owner)) {
            ps.setObject(1, id);
            ps.setObject(2, businessId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    private static Map<String, Object> row(Connection conn, String sql, UUID id) throws SQLException {
        Map<String, Object> out = new HashMap<>();
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setObject(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    ResultSetMetaData md = rs.getMetaData();
                    for (int i = 1; i <= md.getColumnCount(); i++) out.put(md.getColumnLabel(i), rs.getString(i));
                }
            }
        }
        return out;
    }

    private static UUID asUuid(Object v) {
        try {
            return v == null || String.valueOf(v).isBlank() ? null : UUID.fromString(String.valueOf(v));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private JasperReport report(String template) {
        return reports.computeIfAbsent(template, t -> {
            try (InputStream is = new ClassPathResource("reports/" + t + ".jrxml").getInputStream()) {
                return JasperCompileManager.compileReport(is);
            } catch (Exception e) {
                throw new IllegalStateException("Could not compile " + t + ": " + e.getMessage(), e);
            }
        });
    }
}
