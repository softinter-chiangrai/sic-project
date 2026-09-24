package com.softinter.sicapi.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.PmCustomerRequest;
import com.softinter.sicapi.dto.response.PmCustomerResponse;
import com.softinter.sicapi.entity.db.DbCountry;
import com.softinter.sicapi.entity.db.DbDistrict;
import com.softinter.sicapi.entity.db.DbProvince;
import com.softinter.sicapi.entity.db.DbSubDistrict;
import com.softinter.sicapi.entity.db.DbTitle;
import com.softinter.sicapi.entity.enums.FileVisibility;
import com.softinter.sicapi.entity.ex.StorageUploadReference;
import com.softinter.sicapi.entity.pm.PmCustomer;
import com.softinter.sicapi.entity.su.SuUpload;
import com.softinter.sicapi.repository.db.DbCountryRepository;
import com.softinter.sicapi.repository.db.DbDistrictRepository;
import com.softinter.sicapi.repository.db.DbProvinceRepository;
import com.softinter.sicapi.repository.db.DbSubDistrictRepository;
import com.softinter.sicapi.repository.db.DbTitleRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.repository.su.SuUploadRepository;
import com.softinter.sicapi.service.PmCustomerService;
import com.softinter.sicapi.util.LocalizationHelper;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PmCustomerServiceImpl implements PmCustomerService {

    private final PmCustomerRepository PmCustomerRepository;
    private final DbProvinceRepository provinceRepository;
    private final DbDistrictRepository districtRepository;
    private final DbSubDistrictRepository subDistrictRepository;
    private final DbTitleRepository titleRepository;
    private final DbCountryRepository countryRepository;
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
        PmCustomer customer = PmCustomerRepository.findByIdWithFetch(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบลูกค้ารหัส " + id));
        return toResponse(customer);
    }

    @Override
    @Transactional(readOnly = true) 
    public PmCustomerResponse findByCustomerCode(UUID businessId, String customerCode) {
        PmCustomer customer = PmCustomerRepository.findByBusinessIdAndCustomerCodeWithFetch(businessId, customerCode)
                .orElseThrow(() -> new RuntimeException("ไม่พบลูกค้ารหัส " + customerCode));
        return toResponse(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PmCustomerResponse> findAllByBusiness(UUID businessId, Pageable pageable) {
        return findAllByBusiness(businessId, null, null, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PmCustomerResponse> findAllByBusiness(UUID businessId, String keyword, String status, Pageable pageable) {
        Specification<PmCustomer> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("businessId"), businessId));
            predicates.add(cb.isFalse(root.get("isDelete")));

            // Filter Status
            if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
                if ("active".equalsIgnoreCase(status) || "true".equalsIgnoreCase(status)) {
                    predicates.add(cb.isTrue(root.get("isActive")));
                } else if ("inactive".equalsIgnoreCase(status) || "false".equalsIgnoreCase(status)) {
                    predicates.add(cb.isFalse(root.get("isActive")));
                }
            }

            // Keyword Search across multiple fields
            if (keyword != null && !keyword.trim().isEmpty()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate codePred = cb.like(cb.lower(root.get("customerCode")), pattern);
                Predicate nameEnPred = cb.like(cb.lower(root.get("companyNameEn")), pattern);
                Predicate nameLocalPred = cb.like(cb.lower(root.get("companyNameLocal")), pattern);
                Predicate firstNameEnPred = cb.like(cb.lower(root.get("firstNameEn")), pattern);
                Predicate lastNameEnPred = cb.like(cb.lower(root.get("lastNameEn")), pattern);
                Predicate firstNameLocalPred = cb.like(cb.lower(root.get("firstNameLocal")), pattern);
                Predicate lastNameLocalPred = cb.like(cb.lower(root.get("lastNameLocal")), pattern);
                Predicate taxIdPred = cb.like(cb.lower(root.get("taxId")), pattern);
                Predicate contactPred = cb.like(cb.lower(root.get("contactPerson")), pattern);
                Predicate phonePred = cb.like(cb.lower(root.get("phoneNumber")), pattern);
                Predicate emailPred = cb.like(cb.lower(root.get("email")), pattern);
                Predicate lineIdPred = cb.like(cb.lower(root.get("lineId")), pattern);
                Predicate addressEnPred = cb.like(cb.lower(root.get("addressEn")), pattern);
                Predicate addressLocalPred = cb.like(cb.lower(root.get("addressLocal")), pattern);
                Predicate zipCodePred = cb.like(cb.lower(root.get("zipCode")), pattern);
                Predicate remarkPred = cb.like(cb.lower(root.get("remark")), pattern);

                List<Predicate> orPreds = new ArrayList<>(List.of(
                        codePred, nameEnPred, nameLocalPred, firstNameEnPred, lastNameEnPred,
                        firstNameLocalPred, lastNameLocalPred, taxIdPred, contactPred,
                        phonePred, emailPred, lineIdPred, addressEnPred, addressLocalPred, zipCodePred, remarkPred
                ));

                // ✅ Bilingual: รองรับพิมพ์คำไทย/อังกฤษของสถานะในช่อง Search
                String rawKw = keyword.trim().toLowerCase();
                if (rawKw.contains("ใช้งาน") && !rawKw.contains("ไม่")) {
                    orPreds.add(cb.isTrue(root.get("isActive")));
                } else if (rawKw.contains("ไม่ใช้งาน") || rawKw.contains("inactive")) {
                    orPreds.add(cb.isFalse(root.get("isActive")));
                } else if (rawKw.equals("active")) {
                    orPreds.add(cb.isTrue(root.get("isActive")));
                }

                predicates.add(cb.or(orPreds.toArray(new Predicate[0])));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return PmCustomerRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PmCustomerResponse> search(UUID businessId, String keyword, Pageable pageable) {
        return findAllByBusiness(businessId, keyword, null, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PmCustomerResponse> findAllActiveByBusiness(UUID businessId) {
        return PmCustomerRepository.findByBusinessIdAndIsActiveTrueWithFetch(businessId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ===== Private Helpers =====

    private void mapRequestToEntity(PmCustomerRequest request, PmCustomer customer) {
        customer.setCustomerCode(request.getCustomerCode());
        customer.setTaxId(request.getTaxId());
        customer.setBranchCode(request.getBranchCode());
        customer.setPersonType(request.getPersonType());

        // Names
        customer.setFirstNameEn(request.getFirstNameEn());
        customer.setMiddleNameEn(request.getMiddleNameEn());
        customer.setLastNameEn(request.getLastNameEn());
        customer.setFirstNameLocal(request.getFirstNameLocal());
        customer.setMiddleNameLocal(request.getMiddleNameLocal());
        customer.setLastNameLocal(request.getLastNameLocal());

        if ("CORPORATE".equalsIgnoreCase(request.getPersonType())) {
            String nameEn = request.getFirstNameEn() != null && !request.getFirstNameEn().isBlank()
                    ? request.getFirstNameEn()
                    : request.getCompanyNameEn();
            customer.setCompanyNameEn(nameEn != null ? nameEn : "");
            if (customer.getFirstNameEn() == null || customer.getFirstNameEn().isBlank()) {
                customer.setFirstNameEn(nameEn);
            }

            String nameLocal = request.getFirstNameLocal() != null && !request.getFirstNameLocal().isBlank()
                    ? request.getFirstNameLocal()
                    : request.getCompanyNameLocal();
            customer.setCompanyNameLocal(nameLocal != null ? nameLocal : "");
            if (customer.getFirstNameLocal() == null || customer.getFirstNameLocal().isBlank()) {
                customer.setFirstNameLocal(nameLocal);
            }
        } else {
            // INDIVIDUAL
            String nameEn = Stream.of(request.getFirstNameEn(), request.getMiddleNameEn(), request.getLastNameEn())
                    .filter(s -> s != null && !s.isBlank())
                    .collect(Collectors.joining(" "));
            if (nameEn.isBlank() && request.getCompanyNameEn() != null) {
                nameEn = request.getCompanyNameEn();
            }
            customer.setCompanyNameEn(nameEn);

            String nameLocal = Stream.of(request.getFirstNameLocal(), request.getMiddleNameLocal(), request.getLastNameLocal())
                    .filter(s -> s != null && !s.isBlank())
                    .collect(Collectors.joining(" "));
            if (nameLocal.isBlank() && request.getCompanyNameLocal() != null) {
                nameLocal = request.getCompanyNameLocal();
            }
            customer.setCompanyNameLocal(nameLocal);
        }

        // Title
        if (request.getTitleId() != null) {
            DbTitle title = titleRepository.findById(request.getTitleId()).orElse(null);
            customer.setTitle(title);
        } else {
            customer.setTitle(null);
        }

        customer.setContactPerson(request.getContactPerson());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setEmail(request.getEmail());
        customer.setLineId(request.getLineId());
        customer.setAddressEn(request.getAddressEn());
        customer.setAddressLocal(request.getAddressLocal());
        customer.setZipCode(request.getZipCode());
        customer.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        customer.setRemark(request.getRemark());
        customer.setUploadGroupId(request.getUploadGroupId());
        customer.setSupportLocalAddress(request.getSupportLocalAddress() != null ? request.getSupportLocalAddress() : false);

        // Country
        if (request.getCountryId() != null) {
            DbCountry country = countryRepository.findById(request.getCountryId()).orElse(null);
            customer.setCountry(country);
        } else {
            customer.setCountry(null);
        }

        // Location
        if (request.getProvinceId() != null) {
            DbProvince province = provinceRepository.findById(request.getProvinceId())
                    .orElseThrow(() -> new RuntimeException("ไม่พบจังหวัดรหัส " + request.getProvinceId()));
            customer.setProvince(province);
            if (customer.getCountry() == null && province.getCountry() != null) {
                customer.setCountry(province.getCountry());
            }
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

        UUID countryId = null;
        String countryName = null;
        if (customer.getCountry() != null) {
            countryId = customer.getCountry().getId();
            countryName = LocalizationHelper.getCountryName(customer.getCountry());
        } else if (customer.getProvince() != null && customer.getProvince().getCountry() != null) {
            countryId = customer.getProvince().getCountry().getId();
            countryName = LocalizationHelper.getCountryName(customer.getProvince().getCountry());
        }

        String firstNameEn = customer.getFirstNameEn() != null ? customer.getFirstNameEn() : customer.getCompanyNameEn();
        String firstNameLocal = customer.getFirstNameLocal() != null ? customer.getFirstNameLocal() : customer.getCompanyNameLocal();

        boolean supportLocal = customer.getSupportLocalAddress() != null
                ? customer.getSupportLocalAddress()
                : (customer.getProvince() != null || customer.getProvinceId() != null);

        return PmCustomerResponse.builder()
                .id(customer.getId())
                .businessId(customer.getBusinessId())
                .customerCode(customer.getCustomerCode())
                .taxId(customer.getTaxId())
                .branchCode(customer.getBranchCode())
                .titleId(customer.getTitle() != null ? customer.getTitle().getId() : customer.getTitleId())
                .titleName(customer.getTitle() != null ? LocalizationHelper.getTitleName(customer.getTitle()) : null)
                .companyNameEn(customer.getCompanyNameEn())
                .companyNameLocal(customer.getCompanyNameLocal())
                .firstNameEn(firstNameEn)
                .middleNameEn(customer.getMiddleNameEn())
                .lastNameEn(customer.getLastNameEn())
                .firstNameLocal(firstNameLocal)
                .middleNameLocal(customer.getMiddleNameLocal())
                .lastNameLocal(customer.getLastNameLocal())
                .contactPerson(customer.getContactPerson())
                .phoneNumber(customer.getPhoneNumber())
                .email(customer.getEmail())
                .lineId(customer.getLineId())
                .addressEn(customer.getAddressEn())
                .addressLocal(customer.getAddressLocal())
                .countryId(countryId)
                .countryName(countryName)
                .supportLocalAddress(supportLocal)
                .provinceId(customer.getProvince() != null ? customer.getProvince().getId() : null)
                .provinceName(customer.getProvince() != null
                        ? LocalizationHelper.getProvinceName(customer.getProvince())
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
                .personType(customer.getPersonType() != null ? customer.getPersonType() : "CORPORATE")
                .isActive(customer.getIsActive())
                .remark(customer.getRemark())
                .createdDate(customer.getCreatedDate())
                .updatedDate(customer.getUpdatedDate())
                .rowVersion(customer.getRowVersion())
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
