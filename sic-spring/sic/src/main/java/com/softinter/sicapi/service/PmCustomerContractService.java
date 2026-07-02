package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.PmCustomerContractRequest;
import com.softinter.sicapi.dto.response.ComboboxResponse;
import com.softinter.sicapi.dto.response.PmCustomerContractResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface PmCustomerContractService {

    Page<PmCustomerContractResponse> getContracts(
            UUID businessId,
            String keyword,
            String status,
            String contractType,
            Pageable pageable
    );

    PmCustomerContractResponse getContract(UUID id);

    UUID saveContract(UUID businessId, PmCustomerContractRequest request);

    void deleteContract(UUID id);

    List<ComboboxResponse> getLovContractTypes();

    List<ComboboxResponse> getLovSignStatuses();

    // ✅ Combobox Project (กรองตาม customerId)
    List<ComboboxResponse> getComboboxProjects(UUID businessId, UUID customerId);
}