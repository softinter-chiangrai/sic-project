package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmCustomerContractExportService {
    byte[] exportContractPdf(UUID contractId, UUID businessId, String lang);

    default byte[] exportContractPdf(UUID contractId, UUID businessId) {
        return exportContractPdf(contractId, businessId, "th");
    }
}
