package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmCustomerProjectExportService {

    /**
     * Export customer project document as PDF bytes using JasperReports.
     *
     * @param id         Project UUID
     * @param businessId Business UUID
     * @param lang       Language code (th / en)
     * @return PDF bytes
     */
    byte[] exportProjectPdf(UUID id, UUID businessId, String lang);

    default byte[] exportProjectPdf(UUID id, UUID businessId) {
        return exportProjectPdf(id, businessId, "th");
    }
}
