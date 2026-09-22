package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmMaRenewalExportService {
    byte[] exportRenewalPdf(UUID renewalId, UUID businessId, String lang);

    default byte[] exportRenewalPdf(UUID renewalId, UUID businessId) {
        return exportRenewalPdf(renewalId, businessId, "th");
    }
}
