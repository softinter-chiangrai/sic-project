package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmUserManualExportService {
    byte[] exportUserManualPdf(UUID manualId, UUID businessId);
}
