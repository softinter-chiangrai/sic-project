package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PmInvoiceRequest;
import com.softinter.sicapi.dto.response.PmInvoiceResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PmInvoiceService {
    Page<PmInvoiceResponse> findAll(UUID businessId, UUID projectId, Pageable pageable);
    PmInvoiceResponse findById(UUID id, UUID businessId);
    UUID save(PmInvoiceRequest request, UUID businessId, String userId);
    void delete(UUID id, UUID businessId, String userId);
}
