package com.softinter.sicapi.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.softinter.sicapi.dto.request.PmCustomerRequest;
import com.softinter.sicapi.dto.response.PmCustomerResponse;

public interface PmCustomerService {

    PmCustomerResponse create(UUID businessId, PmCustomerRequest request);

    PmCustomerResponse update(UUID id, PmCustomerRequest request);

    void delete(UUID id);

    PmCustomerResponse findById(UUID id);

    PmCustomerResponse findByCustomerCode(UUID businessId, String customerCode);

    Page<PmCustomerResponse> findAllByBusiness(UUID businessId, Pageable pageable);

    Page<PmCustomerResponse> search(UUID businessId, String keyword, Pageable pageable);

    List<PmCustomerResponse> findAllActiveByBusiness(UUID businessId);
}