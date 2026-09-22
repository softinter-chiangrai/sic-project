package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmMaTicketExportService {
    byte[] exportTicketPdf(UUID ticketId, UUID businessId, String lang);

    default byte[] exportTicketPdf(UUID ticketId, UUID businessId) {
        return exportTicketPdf(ticketId, businessId, "th");
    }
}
