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

    Page<PmCustomerContractResponse> getContracts(
            UUID businessId,
            UUID customerId,
            UUID projectId,
            String keyword,
            String status,
            String contractType,
            Pageable pageable
    );

    // expiringWithinDays: กรองสัญญาที่ endDate อยู่ภายใน N วันนับจากวันนี้ (สำหรับ Preset Tab "หมดอายุเดือนนี้")
    Page<PmCustomerContractResponse> getContracts(
            UUID businessId,
            UUID customerId,
            UUID projectId,
            String keyword,
            String status,
            String contractType,
            Integer expiringWithinDays,
            Pageable pageable
    );

    PmCustomerContractResponse getContract(UUID id);

    com.softinter.sicapi.dto.response.PmContractSummaryResponse getContractSummary(UUID id);

    UUID saveContract(UUID businessId, PmCustomerContractRequest request);

    void deleteContract(UUID id);

    List<ComboboxResponse> getLovContractTypes();

    List<ComboboxResponse> getLovSignStatuses();

    // ✅ Combobox Project (กรองตาม customerId)
    List<ComboboxResponse> getComboboxProjects(UUID businessId, UUID customerId);

    // ✅ Combobox Contract (กรองตาม customerId หรือ projectId หรือ businessId)
    List<ComboboxResponse> getComboboxContracts(UUID businessId, UUID customerId, UUID projectId);
}