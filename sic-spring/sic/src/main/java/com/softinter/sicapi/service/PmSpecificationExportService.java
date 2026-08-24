package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmSpecificationExportService {
    byte[] exportSpecificationPdf(UUID specId, UUID businessId);
}
