package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmCustomerProjectExportService {

    /**
     * Export customer project document as PDF bytes using JasperReports.
     *
     * @param id         Project UUID
     * @param businessId Business UUID
     * @return PDF bytes
     */
    byte[] exportProjectPdf(UUID id, UUID businessId);
}
