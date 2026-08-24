package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmInvoiceExportService {
    byte[] exportInvoicePdf(UUID invoiceId, UUID businessId);
}
