package com.softinter.sicapi.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.softinter.sicapi.dto.response.LovResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.entity.db.DbCountry;
import com.softinter.sicapi.entity.db.DbDistrict;
import com.softinter.sicapi.entity.db.DbParameter;
import com.softinter.sicapi.entity.db.DbProvince;
import com.softinter.sicapi.entity.db.DbSubDistrict;
import com.softinter.sicapi.entity.db.DbTitle;
import com.softinter.sicapi.repository.db.DbCountryRepository;
import com.softinter.sicapi.repository.db.DbDistrictRepository;
import com.softinter.sicapi.repository.db.DbParameterRepository;
import com.softinter.sicapi.repository.db.DbProvinceRepository;
import com.softinter.sicapi.repository.db.DbSubDistrictRepository;
import com.softinter.sicapi.repository.db.DbTitleRepository;
import com.softinter.sicapi.service.ComboboxService;
import com.softinter.sicapi.util.LocalizationHelper;   // ✅ import
import com.softinter.sicapi.util.PaginationUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ComboboxServiceImpl implements ComboboxService {

    private final DbTitleRepository titleRepository;
    private final DbCountryRepository countryRepository;
    private final DbProvinceRepository provinceRepository;
    private final DbDistrictRepository districtRepository;
    private final DbSubDistrictRepository subDistrictRepository;
    private final DbParameterRepository dbParameterRepository;

    // ============================================================
    // 1. Pagination Methods
    // ============================================================

    @Override
    public PaginationResponse<LovResponse> getTitles(String personType, String keyword, int page, int size, String lang) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DbTitle> titlePage;

        if (keyword != null && !keyword.isEmpty()) {
            if (personType != null && !personType.isEmpty()) {
                titlePage = titleRepository.findByIsActiveTrueAndPersonTypeAndPrefixNameEnContainingIgnoreCase(
                        personType, keyword, pageable);
            } else {
                titlePage = titleRepository.findByIsActiveTrueAndPrefixNameEnContainingIgnoreCase(keyword, pageable);
            }
        } else {
            if (personType != null && !personType.isEmpty()) {
                titlePage = titleRepository.findByIsActiveTrueAndPersonType(personType, pageable);
            } else {
                titlePage = titleRepository.findByIsActiveTrue(pageable);
            }
        }

        var data = titlePage.getContent().stream()
                .map(t -> new LovResponse(t.getId(), LocalizationHelper.getTitleName(t))) // ✅ ใช้ Helper
                .collect(Collectors.toList());

        return PaginationUtil.of(data, page, size, titlePage.getTotalElements());
    }

    @Override
    public PaginationResponse<LovResponse> getCountries(String keyword, int page, int size, String lang) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DbCountry> countryPage;

        if (keyword != null && !keyword.isEmpty()) {
            countryPage = countryRepository.findByIsActiveTrueAndCountryNameEnContainingIgnoreCase(keyword, pageable);
        } else {
            countryPage = countryRepository.findByIsActiveTrue(pageable);
        }

        var data = countryPage.getContent().stream()
                .map(c -> new LovResponse(c.getId(), LocalizationHelper.getCountryName(c))) // ✅
                .collect(Collectors.toList());

        return PaginationUtil.of(data, page, size, countryPage.getTotalElements());
    }

    @Override
    public PaginationResponse<LovResponse> getProvinces(UUID countryId, String keyword, int page, int size, String lang) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DbProvince> provincePage;

        if (keyword != null && !keyword.isEmpty()) {
            if (countryId != null) {
                provincePage = provinceRepository.findByCountryIdAndIsActiveTrueAndProvinceNameEnContainingIgnoreCase(
                        countryId, keyword, pageable);
            } else {
                provincePage = provinceRepository.findByIsActiveTrueAndProvinceNameEnContainingIgnoreCase(keyword, pageable);
            }
        } else {
            if (countryId != null) {
                provincePage = provinceRepository.findByCountryIdAndIsActiveTrue(countryId, pageable);
            } else {
                provincePage = provinceRepository.findByIsActiveTrue(pageable);
            }
        }

        var data = provincePage.getContent().stream()
                .map(p -> new LovResponse(p.getId(), LocalizationHelper.getProvinceName(p))) // ✅
                .collect(Collectors.toList());

        return PaginationUtil.of(data, page, size, provincePage.getTotalElements());
    }

    @Override
    public PaginationResponse<LovResponse> getDistricts(UUID provinceId, String keyword, int page, int size, String lang) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DbDistrict> districtPage;

        if (keyword != null && !keyword.isEmpty()) {
            districtPage = districtRepository.findByProvinceIdAndIsActiveTrueAndDistrictNameEnContainingIgnoreCase(
                    provinceId, keyword, pageable);
        } else {
            districtPage = districtRepository.findByProvinceIdAndIsActiveTrue(provinceId, pageable);
        }

        var data = districtPage.getContent().stream()
                .map(d -> new LovResponse(d.getId(), LocalizationHelper.getDistrictName(d))) // ✅
                .collect(Collectors.toList());

        return PaginationUtil.of(data, page, size, districtPage.getTotalElements());
    }

    @Override
    public PaginationResponse<LovResponse> getSubDistricts(UUID districtId, String keyword, int page, int size, String lang) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DbSubDistrict> subDistrictPage;

        if (keyword != null && !keyword.isEmpty()) {
            subDistrictPage = subDistrictRepository.findByDistrictIdAndIsActiveTrueAndSubDistrictNameEnContainingIgnoreCase(
                    districtId, keyword, pageable);
        } else {
            subDistrictPage = subDistrictRepository.findByDistrictIdAndIsActiveTrue(districtId, pageable);
        }

        var data = subDistrictPage.getContent().stream()
                .map(s -> new LovResponse(s.getId(), LocalizationHelper.getSubDistrictName(s))) // ✅
                .collect(Collectors.toList());

        return PaginationUtil.of(data, page, size, subDistrictPage.getTotalElements());
    }

    // ============================================================
    // 2. Get By ID
    // ============================================================

    @Override
    public LovResponse getTitleById(UUID id, String lang) {
        return titleRepository.findById(id)
                .map(t -> new LovResponse(t.getId(), LocalizationHelper.getTitleName(t)))
                .orElse(null);
    }

    @Override
    public LovResponse getCountryById(UUID id, String lang) {
        return countryRepository.findById(id)
                .map(c -> new LovResponse(c.getId(), LocalizationHelper.getCountryName(c)))
                .orElse(null);
    }

    @Override
    public LovResponse getProvinceById(UUID id, String lang) {
        return provinceRepository.findById(id)
                .map(p -> new LovResponse(p.getId(), LocalizationHelper.getProvinceName(p)))
                .orElse(null);
    }

    @Override
    public LovResponse getDistrictById(UUID id, String lang) {
        return districtRepository.findById(id)
                .map(d -> new LovResponse(d.getId(), LocalizationHelper.getDistrictName(d)))
                .orElse(null);
    }

    @Override
    public LovResponse getSubDistrictById(UUID id, String lang) {
        return subDistrictRepository.findById(id)
                .map(s -> new LovResponse(s.getId(), LocalizationHelper.getSubDistrictName(s)))
                .orElse(null);
    }

    // ============================================================
    // 3. List Methods (สำหรับ Budt01Controller)
    // ============================================================

    @Override
    public List<LovResponse> getPersonTypeLov(String lang) {
        List<DbParameter> params = dbParameterRepository
                .findByModuleCodeAndParameterCodeAndIsActiveTrueOrderBySortOrder("DB", "PERSON_TYPE");

        return params.stream()
                .map(p -> new LovResponse(
                        p.getParameterValue(),
                        LocalizationHelper.getParameterName(p) // ✅ ใช้ Helper
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<LovResponse> getTitleList(String personType, String value, String lang) {
        List<DbTitle> titles = titleRepository.findByPersonTypeAndIsActiveTrue(personType);

        if (value != null && !value.isBlank()) {
            UUID uuid = UUID.fromString(value);
            titles = titles.stream()
                    .filter(t -> t.getId().equals(uuid))
                    .collect(Collectors.toList());
        }

        return titles.stream()
                .map(t -> new LovResponse(
                        t.getId().toString(),
                        LocalizationHelper.getTitleName(t) // ✅
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<LovResponse> getCountryList(String value, String lang) {
        boolean useEnglish = "en".equalsIgnoreCase(lang);
        List<DbCountry> countries = countryRepository.findByIsActiveTrueOrderByName(useEnglish);

        if (value != null && !value.isBlank()) {
            UUID uuid = UUID.fromString(value);
            countries = countries.stream()
                    .filter(c -> c.getId().equals(uuid))
                    .collect(Collectors.toList());
        }

        return countries.stream()
                .map(c -> new LovResponse(
                        c.getId().toString(),
                        LocalizationHelper.getCountryName(c) // ✅
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<LovResponse> getProvinceList(UUID countryId, String value, String lang) {
        boolean useEnglish = "en".equalsIgnoreCase(lang);
        List<DbProvince> provinces = provinceRepository.findByCountryIdAndIsActiveTrueOrderByName(countryId, useEnglish);

        if (value != null && !value.isBlank()) {
            UUID uuid = UUID.fromString(value);
            provinces = provinces.stream()
                    .filter(p -> p.getId().equals(uuid))
                    .collect(Collectors.toList());
        }

        return provinces.stream()
                .map(p -> new LovResponse(
                        p.getId().toString(),
                        LocalizationHelper.getProvinceName(p) // ✅
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<LovResponse> getDistrictList(UUID provinceId, String value, String lang) {
        boolean useEnglish = "en".equalsIgnoreCase(lang);
        List<DbDistrict> districts = districtRepository.findByProvinceIdAndIsActiveTrueOrderByName(provinceId, useEnglish);

        if (value != null && !value.isBlank()) {
            UUID uuid = UUID.fromString(value);
            districts = districts.stream()
                    .filter(d -> d.getId().equals(uuid))
                    .collect(Collectors.toList());
        }

        return districts.stream()
                .map(d -> new LovResponse(
                        d.getId().toString(),
                        LocalizationHelper.getDistrictName(d) // ✅
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<LovResponse> getSubDistrictList(UUID districtId, String value, String lang) {
        boolean useEnglish = "en".equalsIgnoreCase(lang);
        List<DbSubDistrict> subDistricts = subDistrictRepository.findByDistrictIdAndIsActiveTrueOrderByName(districtId, useEnglish);

        if (value != null && !value.isBlank()) {
            UUID uuid = UUID.fromString(value);
            subDistricts = subDistricts.stream()
                    .filter(s -> s.getId().equals(uuid))
                    .collect(Collectors.toList());
        }

        return subDistricts.stream()
                .map(s -> new LovResponse(
                        s.getId().toString(),
                        LocalizationHelper.getSubDistrictName(s) 
                ))
                .collect(Collectors.toList());
    }
}