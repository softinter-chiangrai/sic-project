package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmCustomerContractExportService {
    byte[] exportContractPdf(UUID contractId, UUID businessId);
}
