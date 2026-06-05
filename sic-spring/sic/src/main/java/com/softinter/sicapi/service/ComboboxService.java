package com.softinter.sicapi.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.softinter.sicapi.dto.response.LovResponse;
import com.softinter.sicapi.entity.db.DbCountry;
import com.softinter.sicapi.entity.db.DbTitle;
import com.softinter.sicapi.repository.db.DbCountryRepository;
import com.softinter.sicapi.repository.db.DbDistrictRepository;
import com.softinter.sicapi.repository.db.DbProvinceRepository;
import com.softinter.sicapi.repository.db.DbSubDistrictRepository;
import com.softinter.sicapi.repository.db.DbTitleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ComboboxService {
    
    private final DbTitleRepository titleRepository;
    private final DbCountryRepository countryRepository;
    private final DbProvinceRepository provinceRepository;
    private final DbDistrictRepository districtRepository;
    private final DbSubDistrictRepository subDistrictRepository;
    
    public List<LovResponse> getTitles(String personType, String value, String lang) {
        return titleRepository.findByIsActiveTrueOrderByPrefixNameEn()
                .stream()
                .filter(t -> personType == null || personType.equals(t.getPersonType()))
                .map(t -> new LovResponse(t.getId(), getLocalName(t, lang)))
                .collect(Collectors.toList());
    }
    
    public List<LovResponse> getCountries(String value, String lang) {
        return countryRepository.findByIsActiveTrueOrderByCountryNameEn()
                .stream()
                .map(c -> new LovResponse(c.getId(), getLocalName(c, lang)))
                .collect(Collectors.toList());
    }
    
    private String getLocalName(DbTitle title, String lang) {
        return "th".equals(lang) ? title.getPrefixNameLocal() : title.getPrefixNameEn();
    }
    
    private String getLocalName(DbCountry country, String lang) {
        return "th".equals(lang) ? country.getCountryNameLocal() : country.getCountryNameEn();
    }
}
