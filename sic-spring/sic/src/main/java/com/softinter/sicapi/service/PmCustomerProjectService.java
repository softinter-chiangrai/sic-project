package com.softinter.sicapi.service;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.softinter.sicapi.dto.request.PmCustomerProjectRequest;
import com.softinter.sicapi.dto.response.PmCustomerProjectResponse;

import java.util.UUID;

public interface PmCustomerProjectService {

    PmCustomerProjectResponse create(UUID businessId, PmCustomerProjectRequest request);

    PmCustomerProjectResponse update(UUID id, PmCustomerProjectRequest request);

    void delete(UUID id);

    PmCustomerProjectResponse findById(UUID id);

    Page<PmCustomerProjectResponse> findByCustomerId(UUID customerId, UUID businessId, Pageable pageable);

    Page<PmCustomerProjectResponse> searchByCustomerId(UUID customerId, UUID businessId, String keyword, Pageable pageable);
}