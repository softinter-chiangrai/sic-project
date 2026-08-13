package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PmPaymentRequest;
import com.softinter.sicapi.dto.response.PmPaymentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PmPaymentService {
    Page<PmPaymentResponse> findAll(UUID businessId, UUID invoiceId, Pageable pageable);
    PmPaymentResponse findById(UUID id, UUID businessId);
    UUID save(PmPaymentRequest request, UUID businessId, String userId);
    void delete(UUID id, UUID businessId, String userId);
}
