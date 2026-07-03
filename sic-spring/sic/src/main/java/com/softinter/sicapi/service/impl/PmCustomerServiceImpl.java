package com.softinter.sicapi.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.PmCustomerRequest;
import com.softinter.sicapi.dto.response.PmCustomerResponse;
import com.softinter.sicapi.entity.db.DbDistrict;
import com.softinter.sicapi.entity.db.DbProvince;
import com.softinter.sicapi.entity.db.DbSubDistrict;
import com.softinter.sicapi.entity.enums.FileVisibility;
import com.softinter.sicapi.entity.ex.StorageUploadReference;
import com.softinter.sicapi.entity.pm.PmCustomer;
import com.softinter.sicapi.entity.su.SuUpload;
import com.softinter.sicapi.repository.db.DbDistrictRepository;
import com.softinter.sicapi.repository.db.DbProvinceRepository;
import com.softinter.sicapi.repository.db.DbSubDistrictRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.repository.su.SuUploadRepository;
import com.softinter.sicapi.service.PmCustomerService;
import com.softinter.sicapi.util.LocalizationHelper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PmCustomerServiceImpl implements PmCustomerService {

    private final PmCustomerRepository PmCustomerRepository;
    private final DbProvinceRepository provinceRepository;
    private final DbDistrictRepository districtRepository;
    private final DbSubDistrictRepository subDistrictRepository;
    private final SuUploadRepository uploadRepository; 

    @Override
    @Transactional
    public PmCustomerResponse create(UUID businessId, PmCustomerRequest request) {
        // ตรวจสอบรหัสซ้ำ
        PmCustomerRepository.findByBusinessIdAndCustomerCode(businessId, request.getCustomerCode())
                .ifPresent(existing -> {
                    throw new RuntimeException("รหัสลูกค้า '" + request.getCustomerCode() + "' ถูกใช้แล้ว");
                });

        PmCustomer customer = new PmCustomer();
        customer.setBusinessId(businessId);
        mapRequestToEntity(request, customer);
        customer = PmCustomerRepository.save(customer);
        return toResponse(customer);
    }

    @Override
    @Transactional
    public PmCustomerResponse update(UUID id, PmCustomerRequest request) {
        PmCustomer customer = PmCustomerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบลูกค้ารหัส " + id));

        // ถ้าเปลี่ยนรหัส ตรวจสอบซ้ำ
        if (!customer.getCustomerCode().equals(request.getCustomerCode())) {
            PmCustomerRepository.findByBusinessIdAndCustomerCode(customer.getBusinessId(), request.getCustomerCode())
                    .ifPresent(existing -> {
                        throw new RuntimeException("รหัสลูกค้า '" + request.getCustomerCode() + "' ถูกใช้แล้ว");
                    });
        }

        mapRequestToEntity(request, customer);
        customer = PmCustomerRepository.save(customer);
        return toResponse(customer);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        PmCustomer customer = PmCustomerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบลูกค้ารหัส " + id));
        customer.setIsDelete(true);
        customer.setIsActive(false);
        PmCustomerRepository.save(customer);
    }

    @Override
    @Transactional(readOnly = true) 
    public PmCustomerResponse findById(UUID id) {
        PmCustomer customer = PmCustomerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบลูกค้ารหัส " + id));
        return toResponse(customer);
    }

    @Override
    @Transactional(readOnly = true) 
    public PmCustomerResponse findByCustomerCode(UUID businessId, String customerCode) {
        PmCustomer customer = PmCustomerRepository.findByBusinessIdAndCustomerCode(businessId, customerCode)
                .orElseThrow(() -> new RuntimeException("ไม่พบลูกค้ารหัส " + customerCode));
        return toResponse(customer);
    }

     @Override
    @Transactional(readOnly = true)
    public Page<PmCustomerResponse> findAllByBusiness(UUID businessId, Pageable pageable) {
        // ✅ ใช้เมธอดที่มี JOIN FETCH
        return PmCustomerRepository.findByBusinessIdAndIsActiveTrueWithFetch(businessId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PmCustomerResponse> search(UUID businessId, String keyword, Pageable pageable) {
        // ✅ ใช้เมธอดที่มี JOIN FETCH
        return PmCustomerRepository.searchByKeywordWithFetch(businessId, keyword, pageable)
                .map(this::toResponse);
    }

    @Override
    public List<PmCustomerResponse> findAllActiveByBusiness(UUID businessId) {
        return PmCustomerRepository.findByBusinessIdAndIsActiveTrue(businessId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ===== Private Helpers =====

    private void mapRequestToEntity(PmCustomerRequest request, PmCustomer customer) {
        customer.setCustomerCode(request.getCustomerCode());
        customer.setTaxId(request.getTaxId());
        customer.setCompanyNameEn(request.getCompanyNameEn());
        customer.setCompanyNameLocal(request.getCompanyNameLocal());
        customer.setContactPerson(request.getContactPerson());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setEmail(request.getEmail());
        customer.setLineId(request.getLineId());
        customer.setAddressEn(request.getAddressEn());
        customer.setAddressLocal(request.getAddressLocal());
        customer.setZipCode(request.getZipCode());
        customer.setPersonType(request.getPersonType());
        customer.setIsActive(request.getIsActive());
        customer.setRemark(request.getRemark());
        customer.setUploadGroupId(request.getUploadGroupId());

        // Location
        if (request.getProvinceId() != null) {
            DbProvince province = provinceRepository.findById(request.getProvinceId())
                    .orElseThrow(() -> new RuntimeException("ไม่พบจังหวัดรหัส " + request.getProvinceId()));
            customer.setProvince(province);
        } else {
            customer.setProvince(null);
        }

        if (request.getDistrictId() != null) {
            DbDistrict district = districtRepository.findById(request.getDistrictId())
                    .orElseThrow(() -> new RuntimeException("ไม่พบอำเภอรหัส " + request.getDistrictId()));
            customer.setDistrict(district);
        } else {
            customer.setDistrict(null);
        }

        if (request.getSubDistrictId() != null) {
            DbSubDistrict subDistrict = subDistrictRepository.findById(request.getSubDistrictId())
                    .orElseThrow(() -> new RuntimeException("ไม่พบตำบลรหัส " + request.getSubDistrictId()));
            customer.setSubDistrict(subDistrict);
        } else {
            customer.setSubDistrict(null);
        }

        // Optimistic locking
        if (request.getRowVersion() != null) {
            customer.setRowVersion(request.getRowVersion());
        }
    }

    private PmCustomerResponse toResponse(PmCustomer customer) {
    // สร้าง uploadGroupData
    List<StorageUploadReference> uploadData = new ArrayList<>();
    if (customer.getUploadGroupId() != null) {
        List<SuUpload> uploads = uploadRepository
                .findAllByUploadGroupIdAndIsActiveTrueOrderByCreatedDateDesc(customer.getUploadGroupId());
        for (SuUpload upload : uploads) {
            StorageUploadReference ref = new StorageUploadReference();
            ref.setId(upload.getId());
            ref.setUploadGroupId(customer.getUploadGroupId());
            ref.setFileName(upload.getFileName());
            ref.setContentType(upload.getContentType());
            ref.setFileSize(upload.getFileSize());
            ref.setAccessUrl(upload.getAccessUrl());
            ref.setIsActive(upload.getIsActive());
            ref.setIsStreaming(upload.getIsStreaming() != null ? upload.getIsStreaming() : false);
            ref.setVisibility(mapVisibilityToString(upload.getVisibility()));
            ref.setState(0);
            uploadData.add(ref);
        }
    }

        return PmCustomerResponse.builder()
                .id(customer.getId())
                .businessId(customer.getBusinessId())
                .customerCode(customer.getCustomerCode())
                .taxId(customer.getTaxId())
                .companyNameEn(customer.getCompanyNameEn())
                .companyNameLocal(customer.getCompanyNameLocal())
                .contactPerson(customer.getContactPerson())
                .phoneNumber(customer.getPhoneNumber())
                .email(customer.getEmail())
                .lineId(customer.getLineId())
                .addressEn(customer.getAddressEn())
                .addressLocal(customer.getAddressLocal())
                .provinceId(customer.getProvince() != null ? customer.getProvince().getId() : null)
                .provinceName(customer.getProvince() != null
                        ? LocalizationHelper.getProvinceName(customer.getProvince())
                        : null)
                .countryId(customer.getProvince() != null && customer.getProvince().getCountry() != null
                        ? customer.getProvince().getCountry().getId()
                        : null)
                .countryName(customer.getProvince() != null && customer.getProvince().getCountry() != null
                        ? LocalizationHelper.getCountryName(customer.getProvince().getCountry())
                        : null)
                .districtId(customer.getDistrict() != null ? customer.getDistrict().getId() : null)
                .districtName(customer.getDistrict() != null
                        ? LocalizationHelper.getDistrictName(customer.getDistrict())
                        : null)
                .subDistrictId(customer.getSubDistrict() != null ? customer.getSubDistrict().getId() : null)
                .subDistrictName(customer.getSubDistrict() != null
                        ? LocalizationHelper.getSubDistrictName(customer.getSubDistrict())
                        : null)
                .zipCode(customer.getZipCode())
                .personType(customer.getPersonType())
                .isActive(customer.getIsActive())
                .remark(customer.getRemark())
                .createdDate(customer.getCreatedDate())
                .updatedDate(customer.getUpdatedDate())
                .rowVersion(customer.getRowVersion())
                // ✅ เพิ่มตรงนี้
                .uploadGroupId(customer.getUploadGroupId())
                .uploadGroupData(uploadData)
                .build();
    }

    // ✅ Helper method (เหมือนใน ProfileServiceImpl)
    private String mapVisibilityToString(FileVisibility visibility) {
        if (visibility == null) return "Public";
        switch (visibility) {
            case UPLOADER_ONLY: return "UploaderOnly";
            case BUSINESS_ONLY: return "BusinessOnly";
            case ANYONE_WITH_LINK: return "AnyoneWithLink";
            case PUBLIC: return "Public";
            default: return "Public";
        }
    }
}
