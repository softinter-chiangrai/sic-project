package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmInvoiceExportService {
    byte[] exportInvoicePdf(UUID invoiceId, UUID businessId, String lang);

    default byte[] exportInvoicePdf(UUID invoiceId, UUID businessId) {
        return exportInvoicePdf(invoiceId, businessId, "th");
    }
}
