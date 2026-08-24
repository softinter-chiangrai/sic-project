package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmMaTicketExportService {
    byte[] exportTicketPdf(UUID ticketId, UUID businessId);
}
