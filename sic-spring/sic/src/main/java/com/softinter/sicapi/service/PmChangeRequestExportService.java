package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmChangeRequestExportService {
    byte[] exportChangeRequestPdf(UUID id, String lang);

    default byte[] exportChangeRequestPdf(UUID id) {
        return exportChangeRequestPdf(id, "th");
    }
}
