package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmSpecificationExportService {
    byte[] exportSpecificationPdf(UUID specId, UUID businessId, String lang);

    default byte[] exportSpecificationPdf(UUID specId, UUID businessId) {
        return exportSpecificationPdf(specId, businessId, "th");
    }
}
