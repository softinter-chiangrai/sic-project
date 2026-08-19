package com.softinter.sicapi.service;

import java.util.UUID;

public interface PmDeliveryExportService {
    byte[] exportDeliveryHandoverPdf(UUID deliveryId, UUID businessId);
}
