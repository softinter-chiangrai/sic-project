package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.response.LovResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;

import java.util.UUID;

public interface ComboboxService {

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
}