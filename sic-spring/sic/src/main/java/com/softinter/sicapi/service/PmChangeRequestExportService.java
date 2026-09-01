package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmChangeRequestExportService {
    byte[] exportChangeRequestPdf(UUID id);
}
