package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmRequirementExportService {

    /**
     * Export requirement document as PDF bytes using JasperReports.
     *
     * @param id         Requirement UUID
     * @param businessId Business UUID (for security scope)
     * @return PDF bytes
     */
    byte[] exportRequirementPdf(UUID id, UUID businessId, String lang);

    /**
     * The real Jasper PDF of what is in the form right now, before it is saved: the values are written in a transaction
     * that is rolled back after the report is filled, so nothing is stored.
     */
    byte[] previewRequirementPdf(com.softinter.sicapi.dto.request.PmRequirementRequest form, UUID businessId, String userName, String lang);

    default byte[] exportRequirementPdf(UUID id, UUID businessId) {
        return exportRequirementPdf(id, businessId, "th");
    }
}
