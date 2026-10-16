package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.service.PmChangeRequestExportService;
import com.softinter.sicapi.service.PmCustomerContractExportService;
import com.softinter.sicapi.service.PmDeliveryExportService;
import com.softinter.sicapi.service.PmInvoiceExportService;
import com.softinter.sicapi.service.PmMaTicketExportService;
import com.softinter.sicapi.service.PmRequirementExportService;
import com.softinter.sicapi.service.PmSpecificationExportService;
import com.softinter.sicapi.service.PmUatExportService;
import com.softinter.sicapi.service.PmUserManualExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Array;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * The single-document PDF of every kind of document, as its own export service makes it, plus the label (code + title) a
 * book or a ZIP shows for it. Used by the project book and by the bulk export of the list pages.
 */
@Component
@RequiredArgsConstructor
public class DocumentPdfExporters {

    private final DataSource dataSource;
    private final PmCustomerContractExportService contractExport;
    private final PmRequirementExportService requirementExport;
    private final PmSpecificationExportService specificationExport;
    private final PmDesignReviewExportService designReviewExport;
    private final PmUserManualExportService userManualExport;
    private final PmDeliveryExportService deliveryExport;
    private final PmInvoiceExportService invoiceExport;
    private final PmMaTicketExportService maTicketExport;
    private final PmChangeRequestExportService changeRequestExport;
    private final PmUatExportService uatExport;

    /** table, label of a row, and how a row belongs to a business (column, or through its project) */
    private record Kind(String table, String label, boolean ownBusinessColumn) {
    }

    private static final Map<String, Kind> KINDS = Map.of(
            "contract", new Kind("pm_customer_contract", "COALESCE(contract_no, '')", true),
            "requirement", new Kind("pm_requirement", "requirement_code || ' ' || COALESCE(title, '')", true),
            "specification", new Kind("pm_specification", "specification_code || ' ' || COALESCE(title, '')", true),
            "design-review", new Kind("pm_design_review", "COALESCE(review_code, '') || ' ' || COALESCE(title, '')", true),
            "user-manual", new Kind("pm_user_manual", "COALESCE(manual_code, '') || ' ' || COALESCE(manual_title, '')", true),
            "delivery", new Kind("pm_delivery", "COALESCE(delivery_code, '') || ' ' || COALESCE(delivery_title, '')", true),
            "invoice", new Kind("pm_invoice", "COALESCE(invoice_no, '')", true),
            "ma-ticket", new Kind("pm_ma_ticket", "COALESCE(ticket_no, '') || ' ' || COALESCE(title, '')", true),
            "change-request", new Kind("pm_change_request", "COALESCE(cr_code, '') || ' ' || COALESCE(title, '')", false),
            "test-scenario", new Kind("pm_test_scenario", "COALESCE(scenario_code, '') || ' ' || COALESCE(scenario_name, '')", true));

    public boolean supports(String kind) {
        return KINDS.containsKey(kind);
    }

    public byte[] export(String kind, UUID id, UUID businessId, String lang) {
        return switch (kind) {
            case "contract" -> contractExport.exportContractPdf(id, businessId, lang);
            case "requirement" -> requirementExport.exportRequirementPdf(id, businessId, lang);
            case "specification" -> specificationExport.exportSpecificationPdf(id, businessId, lang);
            case "design-review" -> designReviewExport.exportPdf(id, businessId, lang);
            case "user-manual" -> userManualExport.exportUserManualPdf(id, businessId, lang);
            case "delivery" -> deliveryExport.exportDeliveryHandoverPdf(id, businessId, lang);
            case "invoice" -> invoiceExport.exportInvoicePdf(id, businessId, lang);
            case "ma-ticket" -> maTicketExport.exportTicketPdf(id, businessId, lang);
            case "change-request" -> changeRequestExport.exportChangeRequestPdf(id, lang);
            // the UAT report of one scenario, every test type
            case "test-scenario" -> uatExport.exportUatReportPdf(null, businessId, "ALL", id, lang);
            default -> throw new IllegalArgumentException("Unknown document type: " + kind);
        };
    }

    /** id -> label of the given documents that belong to this business, in the order asked; others are left out */
    public Map<UUID, String> labels(String kind, Collection<UUID> ids, UUID businessId) throws Exception {
        Kind k = KINDS.get(kind);
        if (k == null) throw new IllegalArgumentException("Unknown document type: " + kind);
        String owner = k.ownBusinessColumn() ? "business_id = ?"
                : "project_id IN (SELECT p.id FROM pm_customer_project p WHERE p.business_id = ?)";
        return labels(dataSource, "SELECT id, " + k.label() + " FROM " + k.table()
                + " WHERE id = ANY(?) AND COALESCE(is_delete, false) = false AND " + owner, ids, businessId);
    }

    /** rows (id, label) of sql, whose parameters are the ids (uuid[]) and the business id, in the order of ids */
    static Map<UUID, String> labels(DataSource ds, String sql, Collection<UUID> ids, UUID businessId) throws Exception {
        Map<UUID, String> found = new java.util.HashMap<>();
        try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            Array arr = c.createArrayOf("uuid", ids.toArray());
            ps.setArray(1, arr);
            ps.setObject(2, businessId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) found.put(UUID.fromString(rs.getString(1)), String.valueOf(rs.getString(2)).trim());
            }
        }
        Map<UUID, String> ordered = new LinkedHashMap<>();
        for (UUID id : ids) if (found.containsKey(id)) ordered.put(id, found.get(id));
        return ordered;
    }

}
