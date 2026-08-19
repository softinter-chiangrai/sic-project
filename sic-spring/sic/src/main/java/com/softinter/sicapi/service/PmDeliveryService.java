package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PmDeliveryRequest;
import com.softinter.sicapi.dto.response.PmDeliveryGateCheckResponse;
import com.softinter.sicapi.dto.response.PmDeliveryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PmDeliveryService {
    Page<PmDeliveryResponse> findAll(UUID businessId, UUID projectId, Pageable pageable);
    PmDeliveryResponse findById(UUID id, UUID businessId);
    UUID save(PmDeliveryRequest request, UUID businessId, String userId);
    void delete(UUID id, UUID businessId, String userId);
    PmDeliveryGateCheckResponse gateCheck(UUID deliveryId, UUID projectId, UUID businessId);
    
    // Phase 4: Sign-off & Invoicing
    PmDeliveryResponse signOff(UUID deliveryId, String signedBy, UUID businessId, String userId);
    UUID createInvoiceFromDelivery(UUID deliveryId, UUID businessId, String userId);
}

