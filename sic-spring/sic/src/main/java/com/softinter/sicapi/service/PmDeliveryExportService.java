package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmDeliveryExportService {
    byte[] exportDeliveryHandoverPdf(UUID deliveryId, UUID businessId, String lang);

    default byte[] exportDeliveryHandoverPdf(UUID deliveryId, UUID businessId) {
        return exportDeliveryHandoverPdf(deliveryId, businessId, "th");
    }
}
