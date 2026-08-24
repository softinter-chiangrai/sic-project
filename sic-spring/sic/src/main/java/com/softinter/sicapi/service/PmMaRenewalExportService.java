package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmMaRenewalExportService {
    byte[] exportRenewalPdf(UUID renewalId, UUID businessId);
}
