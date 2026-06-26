package com.softinter.sicapi.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.SuCustomerRequest;
import com.softinter.sicapi.dto.response.SuCustomerResponse;
import com.softinter.sicapi.entity.db.DbDistrict;
import com.softinter.sicapi.entity.db.DbProvince;
import com.softinter.sicapi.entity.db.DbSubDistrict;
import com.softinter.sicapi.entity.su.SuCustomer;
import com.softinter.sicapi.repository.db.DbDistrictRepository;
import com.softinter.sicapi.repository.db.DbProvinceRepository;
import com.softinter.sicapi.repository.db.DbSubDistrictRepository;
import com.softinter.sicapi.repository.su.SuCustomerRepository;
import com.softinter.sicapi.service.SuCustomerService;
import com.softinter.sicapi.util.LocalizationHelper;  // ✅ import

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SuCustomerServiceImpl implements SuCustomerService {

    private final SuCustomerRepository suCustomerRepository;
    private final DbProvinceRepository provinceRepository;
    private final DbDistrictRepository districtRepository;
    private final DbSubDistrictRepository subDistrictRepository;

    @Override
    @Transactional
    public SuCustomerResponse create(UUID businessId, SuCustomerRequest request) {
        if (suCustomerRepository.findByBusinessIdAndCustomerCode(businessId, request.getCustomerCode()).isPresent()) {
            throw new RuntimeException("รหัสลูกค้า '" + request.getCustomerCode() + "' ถูกใช้แล้ว");
        }

        SuCustomer customer = new SuCustomer();
        customer.setBusinessId(businessId);
        mapRequestToEntity(request, customer);
        customer = suCustomerRepository.save(customer);
        return toResponse(customer);
    }

    @Override
    @Transactional
    public SuCustomerResponse update(UUID id, SuCustomerRequest request) {
        SuCustomer customer = suCustomerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบลูกค้ารหัส " + id));

        if (!customer.getCustomerCode().equals(request.getCustomerCode())) {
            suCustomerRepository.findByBusinessIdAndCustomerCode(customer.getBusinessId(), request.getCustomerCode())
                    .ifPresent(existing -> {
                        throw new RuntimeException("รหัสลูกค้า '" + request.getCustomerCode() + "' ถูกใช้แล้ว");
                    });
        }

        mapRequestToEntity(request, customer);
        customer = suCustomerRepository.save(customer);
        return toResponse(customer);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        SuCustomer customer = suCustomerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบลูกค้ารหัส " + id));
        customer.setIsDelete(true);
        suCustomerRepository.save(customer);
    }

    @Override
    public SuCustomerResponse findById(UUID id) {
        SuCustomer customer = suCustomerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบลูกค้ารหัส " + id));
        return toResponse(customer);
    }

    @Override
    public SuCustomerResponse findByCustomerCode(UUID businessId, String customerCode) {
        SuCustomer customer = suCustomerRepository.findByBusinessIdAndCustomerCode(businessId, customerCode)
                .orElseThrow(() -> new RuntimeException("ไม่พบลูกค้ารหัส " + customerCode));
        return toResponse(customer);
    }

    @Override
    public Page<SuCustomerResponse> findAllByBusiness(UUID businessId, Pageable pageable) {
        return suCustomerRepository.findByBusinessIdAndIsActiveTrue(businessId, pageable)
                .map(this::toResponse);
    }

    @Override
    public Page<SuCustomerResponse> search(UUID businessId, String keyword, Pageable pageable) {
        return suCustomerRepository.searchByKeyword(businessId, keyword, pageable)
                .map(this::toResponse);
    }

    @Override
    public List<SuCustomerResponse> findAllActiveByBusiness(UUID businessId) {
        return suCustomerRepository.findByBusinessIdAndIsActiveTrue(businessId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ===== Private Helpers =====

    private void mapRequestToEntity(SuCustomerRequest request, SuCustomer customer) {
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
        customer.setCustomerType(request.getCustomerType());
        customer.setIsActive(request.getIsActive());
        customer.setRemark(request.getRemark());

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
    }

    // ============================================================
    // ✅ toResponse - ใช้ LocalizationHelper แทนการ hardcode Local
    // ============================================================
    private SuCustomerResponse toResponse(SuCustomer customer) {
        return SuCustomerResponse.builder()
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
                // ✅ ใช้ LocalizationHelper.getProvinceName() แทนการ hardcode Local
                .provinceName(customer.getProvince() != null 
                        ? LocalizationHelper.getProvinceName(customer.getProvince()) 
                        : null)
                .districtId(customer.getDistrict() != null ? customer.getDistrict().getId() : null)
                // ✅ ใช้ LocalizationHelper.getDistrictName()
                .districtName(customer.getDistrict() != null 
                        ? LocalizationHelper.getDistrictName(customer.getDistrict()) 
                        : null)
                .subDistrictId(customer.getSubDistrict() != null ? customer.getSubDistrict().getId() : null)
                // ✅ ใช้ LocalizationHelper.getSubDistrictName()
                .subDistrictName(customer.getSubDistrict() != null 
                        ? LocalizationHelper.getSubDistrictName(customer.getSubDistrict()) 
                        : null)
                .zipCode(customer.getZipCode())
                .customerType(customer.getCustomerType())
                .isActive(customer.getIsActive())
                .remark(customer.getRemark())
                .createdDate(customer.getCreatedDate())
                .updatedDate(customer.getUpdatedDate())
                .build();
    }
}