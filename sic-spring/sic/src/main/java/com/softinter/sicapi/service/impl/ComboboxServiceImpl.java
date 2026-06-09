package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.response.LovResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.entity.db.DbCountry;
import com.softinter.sicapi.entity.db.DbDistrict;
import com.softinter.sicapi.entity.db.DbProvince;
import com.softinter.sicapi.entity.db.DbSubDistrict;
import com.softinter.sicapi.entity.db.DbTitle;
import com.softinter.sicapi.repository.db.DbCountryRepository;
import com.softinter.sicapi.repository.db.DbDistrictRepository;
import com.softinter.sicapi.repository.db.DbProvinceRepository;
import com.softinter.sicapi.repository.db.DbSubDistrictRepository;
import com.softinter.sicapi.repository.db.DbTitleRepository;
import com.softinter.sicapi.service.ComboboxService;
import com.softinter.sicapi.util.PaginationUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComboboxServiceImpl implements ComboboxService {

    private final DbTitleRepository titleRepository;
    private final DbCountryRepository countryRepository;
    private final DbProvinceRepository provinceRepository;
    private final DbDistrictRepository districtRepository;
    private final DbSubDistrictRepository subDistrictRepository;

    // Helper localization
    private String getLocalTitleName(DbTitle t, String lang) {
        return "th".equals(lang) ? t.getPrefixNameLocal() : t.getPrefixNameEn();
    }

    private String getLocalCountryName(DbCountry c, String lang) {
        return "th".equals(lang) ? c.getCountryNameLocal() : c.getCountryNameEn();
    }

    private String getLocalProvinceName(DbProvince p, String lang) {
        return "th".equals(lang) ? p.getProvinceNameLocal() : p.getProvinceNameEn();
    }

    private String getLocalDistrictName(DbDistrict d, String lang) {
        return "th".equals(lang) ? d.getDistrictNameLocal() : d.getDistrictNameEn();
    }

    private String getLocalSubDistrictName(DbSubDistrict s, String lang) {
        return "th".equals(lang) ? s.getSubDistrictNameLocal() : s.getSubDistrictNameEn();
    }

    @Override
    public PaginationResponse<LovResponse> getTitles(String personType, String keyword, int page, int size, String lang) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DbTitle> titlePage;
        if (keyword != null && !keyword.isEmpty()) {
            if (personType != null && !personType.isEmpty()) {
                titlePage = titleRepository.findByIsActiveTrueAndPersonTypeAndPrefixNameEnContainingIgnoreCase(personType, keyword, pageable);
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
                .map(t -> new LovResponse(t.getId(), getLocalTitleName(t, lang)))
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
                .map(c -> new LovResponse(c.getId(), getLocalCountryName(c, lang)))
                .collect(Collectors.toList());
        return PaginationUtil.of(data, page, size, countryPage.getTotalElements());
    }

    @Override
    public PaginationResponse<LovResponse> getProvinces(UUID countryId, String keyword, int page, int size, String lang) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DbProvince> provincePage;
        if (keyword != null && !keyword.isEmpty()) {
            if (countryId != null) {
                provincePage = provinceRepository.findByCountryIdAndIsActiveTrueAndProvinceNameEnContainingIgnoreCase(countryId, keyword, pageable);
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
                .map(p -> new LovResponse(p.getId(), getLocalProvinceName(p, lang)))
                .collect(Collectors.toList());
        return PaginationUtil.of(data, page, size, provincePage.getTotalElements());
    }

    @Override
    public PaginationResponse<LovResponse> getDistricts(UUID provinceId, String keyword, int page, int size, String lang) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DbDistrict> districtPage;
        if (keyword != null && !keyword.isEmpty()) {
            districtPage = districtRepository.findByProvinceIdAndIsActiveTrueAndDistrictNameEnContainingIgnoreCase(provinceId, keyword, pageable);
        } else {
            districtPage = districtRepository.findByProvinceIdAndIsActiveTrue(provinceId, pageable);
        }
        var data = districtPage.getContent().stream()
                .map(d -> new LovResponse(d.getId(), getLocalDistrictName(d, lang)))
                .collect(Collectors.toList());
        return PaginationUtil.of(data, page, size, districtPage.getTotalElements());
    }

    @Override
    public PaginationResponse<LovResponse> getSubDistricts(UUID districtId, String keyword, int page, int size, String lang) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DbSubDistrict> subDistrictPage;
        if (keyword != null && !keyword.isEmpty()) {
            subDistrictPage = subDistrictRepository.findByDistrictIdAndIsActiveTrueAndSubDistrictNameEnContainingIgnoreCase(districtId, keyword, pageable);
        } else {
            subDistrictPage = subDistrictRepository.findByDistrictIdAndIsActiveTrue(districtId, pageable);
        }
        var data = subDistrictPage.getContent().stream()
                .map(s -> new LovResponse(s.getId(), getLocalSubDistrictName(s, lang)))
                .collect(Collectors.toList());
        return PaginationUtil.of(data, page, size, subDistrictPage.getTotalElements());
    }

    @Override
    public LovResponse getTitleById(UUID id, String lang) {
        return titleRepository.findById(id)
                .map(t -> new LovResponse(t.getId(), getLocalTitleName(t, lang)))
                .orElse(null);
    }

    @Override
    public LovResponse getCountryById(UUID id, String lang) {
        return countryRepository.findById(id)
                .map(c -> new LovResponse(c.getId(), getLocalCountryName(c, lang)))
                .orElse(null);
    }

    @Override
    public LovResponse getProvinceById(UUID id, String lang) {
        return provinceRepository.findById(id)
                .map(p -> new LovResponse(p.getId(), getLocalProvinceName(p, lang)))
                .orElse(null);
    }

    @Override
    public LovResponse getDistrictById(UUID id, String lang) {
        return districtRepository.findById(id)
                .map(d -> new LovResponse(d.getId(), getLocalDistrictName(d, lang)))
                .orElse(null);
    }

    @Override
    public LovResponse getSubDistrictById(UUID id, String lang) {
        return subDistrictRepository.findById(id)
                .map(s -> new LovResponse(s.getId(), getLocalSubDistrictName(s, lang)))
                .orElse(null);
    }
}