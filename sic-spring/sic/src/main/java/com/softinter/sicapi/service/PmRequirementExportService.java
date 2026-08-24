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
    byte[] exportRequirementPdf(UUID id, UUID businessId);
}
