package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PmMaTicketRequest;
import com.softinter.sicapi.dto.response.PmMaTicketResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PmMaTicketService {
    Page<PmMaTicketResponse> findAll(UUID businessId, UUID projectId, Pageable pageable);
    PmMaTicketResponse findById(UUID id, UUID businessId);
    UUID save(PmMaTicketRequest request, UUID businessId, String userId);
    void delete(UUID id, UUID businessId, String userId);
}
