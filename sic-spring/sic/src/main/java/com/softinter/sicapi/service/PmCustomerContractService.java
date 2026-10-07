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

    /**
     * latestOnly = true: ซ่อนฉบับที่ถูกต่ออายุไปแล้ว (มีฉบับต่ออายุที่ยังไม่ถูกยกเลิก/ลบ) เหลือเฉพาะฉบับล่าสุดของแต่ละสาย
     */
    Page<PmCustomerContractResponse> getContracts(
            UUID businessId,
            UUID customerId,
            UUID projectId,
            String keyword,
            String status,
            String contractType,
            Integer expiringWithinDays,
            boolean latestOnly,
            Pageable pageable
    );

    /** สายการต่ออายุทั้งหมดของสัญญานี้ เรียงจากฉบับแรกถึงฉบับล่าสุด */
    java.util.List<PmCustomerContractResponse> getRenewalChain(UUID id);

    PmCustomerContractResponse getContract(UUID id);

    com.softinter.sicapi.dto.response.PmContractSummaryResponse getContractSummary(UUID id);

    UUID saveContract(UUID businessId, PmCustomerContractRequest request);

    void deleteContract(UUID id);

    /** ยกเลิกสัญญา (ไม่ลบ): ตั้งสถานะต่อสัญญาเป็น "ยกเลิก" ยกเลิกคำขออนุมัติที่ค้างอยู่ และบันทึกประวัติ */
    PmCustomerContractResponse cancelContract(UUID id, String reason);

    List<ComboboxResponse> getLovContractTypes();

    List<ComboboxResponse> getLovSignStatuses();

    // ✅ Combobox Project (กรองตาม customerId)
    List<ComboboxResponse> getComboboxProjects(UUID businessId, UUID customerId);

    // ✅ Combobox Contract (กรองตาม customerId หรือ projectId หรือ businessId)
    /** contractType: ถ้าระบุ กรองเฉพาะสัญญาชนิดนั้น (เช่น MA Renewal ใช้ "Maintenance Contract") */
    List<ComboboxResponse> getComboboxContracts(UUID businessId, UUID customerId, UUID projectId, String contractType);
}