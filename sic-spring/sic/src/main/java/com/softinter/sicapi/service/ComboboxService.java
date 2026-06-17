package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.response.LovResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;

import java.util.List;
import java.util.UUID;

public interface ComboboxService {

    // ====== Pagination (ของเดิม) ======
    PaginationResponse<LovResponse> getTitles(String personType, String keyword, int page, int size, String lang);
    PaginationResponse<LovResponse> getCountries(String keyword, int page, int size, String lang);
    PaginationResponse<LovResponse> getProvinces(UUID countryId, String keyword, int page, int size, String lang);
    PaginationResponse<LovResponse> getDistricts(UUID provinceId, String keyword, int page, int size, String lang);
    PaginationResponse<LovResponse> getSubDistricts(UUID districtId, String keyword, int page, int size, String lang);

    LovResponse getTitleById(UUID id, String lang);
    LovResponse getCountryById(UUID id, String lang);
    LovResponse getProvinceById(UUID id, String lang);
    LovResponse getDistrictById(UUID id, String lang);
    LovResponse getSubDistrictById(UUID id, String lang);

    // ✅ ====== List (เพิ่มใหม่ สำหรับ Budt01Controller) ======
    List<LovResponse> getPersonTypeLov(String lang);
    List<LovResponse> getTitleList(String personType, String value, String lang);
    List<LovResponse> getCountryList(String value, String lang);
    List<LovResponse> getProvinceList(UUID countryId, String value, String lang);
    List<LovResponse> getDistrictList(UUID provinceId, String value, String lang);
    List<LovResponse> getSubDistrictList(UUID districtId, String value, String lang);
}