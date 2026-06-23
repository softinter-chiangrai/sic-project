package com.softinter.sicapi.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.softinter.sicapi.dto.request.SuCustomerRequest;
import com.softinter.sicapi.dto.response.SuCustomerResponse;

public interface SuCustomerService {

    SuCustomerResponse create(UUID businessId, SuCustomerRequest request);

    SuCustomerResponse update(UUID id, SuCustomerRequest request);

    void delete(UUID id);

    SuCustomerResponse findById(UUID id);

    SuCustomerResponse findByCustomerCode(UUID businessId, String customerCode);

    Page<SuCustomerResponse> findAllByBusiness(UUID businessId, Pageable pageable);

    Page<SuCustomerResponse> search(UUID businessId, String keyword, Pageable pageable);

    List<SuCustomerResponse> findAllActiveByBusiness(UUID businessId);
}
