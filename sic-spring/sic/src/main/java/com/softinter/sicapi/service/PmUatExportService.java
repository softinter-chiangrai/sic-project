package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmUatExportService {
    byte[] exportUatReportPdf(UUID projectId, UUID businessId, String testTypeFilter, UUID scenarioId, String lang);

    default byte[] exportUatReportPdf(UUID projectId, UUID businessId, String testTypeFilter, UUID scenarioId) {
        return exportUatReportPdf(projectId, businessId, testTypeFilter, scenarioId, "th");
    }
}
