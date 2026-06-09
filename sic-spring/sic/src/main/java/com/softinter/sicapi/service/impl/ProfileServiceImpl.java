package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.SaveProfileRequest;
import com.softinter.sicapi.dto.response.ProfileResponse;
import com.softinter.sicapi.entity.su.SuProfile;
import com.softinter.sicapi.repository.db.*;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final SuProfileRepository profileRepository;
    private final DbTitleRepository titleRepository;
    private final DbCountryRepository countryRepository;
    private final DbProvinceRepository provinceRepository;
    private final DbDistrictRepository districtRepository;
    private final DbSubDistrictRepository subDistrictRepository;

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getProfileByUserId(String userId) {
        SuProfile profile = profileRepository.findByUserIdAndIsActiveTrue(userId)
                .orElse(new SuProfile());
        return toResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isProfileComplete(String userId) {
        return profileRepository.existsByUserId(userId);
    }

    @Override
    @Transactional
    public UUID saveProfile(String userId, SaveProfileRequest request) {
        SuProfile profile = profileRepository.findByUserId(userId)
                .orElse(new SuProfile());

        profile.setIsActive(true);
        profile.setUserId(userId);
        profile.setEmail(request.getEmail());
        profile.setFirstNameEn(request.getFirstNameEn());
        profile.setMiddleNameEn(request.getMiddleNameEn());
        profile.setLastNameEn(request.getLastNameEn());
        profile.setFirstNameLocal(request.getFirstNameLocal());
        profile.setMiddleNameLocal(request.getMiddleNameLocal());
        profile.setLastNameLocal(request.getLastNameLocal());

        if (request.getTitleId() != null) {
            profile.setTitle(titleRepository.findById(request.getTitleId()).orElse(null));
        }

        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setAddressEn(request.getAddressEn());
        profile.setAddressLocal(request.getAddressLocal());

        if (request.getCountryId() != null) {
            profile.setCountry(countryRepository.findById(request.getCountryId()).orElse(null));
        }
        if (request.getProvinceId() != null) {
            profile.setProvince(provinceRepository.findById(request.getProvinceId()).orElse(null));
        }
        if (request.getDistrictId() != null) {
            profile.setDistrict(districtRepository.findById(request.getDistrictId()).orElse(null));
        }
        if (request.getSubDistrictId() != null) {
            profile.setSubDistrict(subDistrictRepository.findById(request.getSubDistrictId()).orElse(null));
        }

        profile.setZipCode(request.getZipCode());
        profile.setIsActive(true);

        profileRepository.save(profile);
        return profile.getId();
    }

    private ProfileResponse toResponse(SuProfile profile) {
        ProfileResponse response = new ProfileResponse();
        response.setId(profile.getId());
        response.setUserId(profile.getUserId());
        response.setTaxId(profile.getTaxId());
        response.setEmail(profile.getEmail());
        response.setFirstNameEn(profile.getFirstNameEn());
        response.setMiddleNameEn(profile.getMiddleNameEn());
        response.setLastNameEn(profile.getLastNameEn());
        response.setFirstNameLocal(profile.getFirstNameLocal());
        response.setMiddleNameLocal(profile.getMiddleNameLocal());
        response.setLastNameLocal(profile.getLastNameLocal());

        if (profile.getTitle() != null) {
            response.setTitleId(profile.getTitle().getId());
            response.setTitleName(getLocalizedTitle(profile));
        }

        response.setPhoneNumber(profile.getPhoneNumber());
        response.setAddressEn(profile.getAddressEn());
        response.setAddressLocal(profile.getAddressLocal());

        if (profile.getCountry() != null) {
            response.setCountryId(profile.getCountry().getId());
            response.setCountryName(getLocalizedCountry(profile));
        }
        if (profile.getProvince() != null) {
            response.setProvinceId(profile.getProvince().getId());
            response.setProvinceName(getLocalizedProvince(profile));
        }
        if (profile.getDistrict() != null) {
            response.setDistrictId(profile.getDistrict().getId());
            response.setDistrictName(getLocalizedDistrict(profile));
        }
        if (profile.getSubDistrict() != null) {
            response.setSubDistrictId(profile.getSubDistrict().getId());
            response.setSubDistrictName(getLocalizedSubDistrict(profile));
        }

        response.setZipCode(profile.getZipCode());
        return response;
    }

    private String getCurrentLanguage() {
        // TODO: ดึงจาก RequestContextHolder หรือ header
        return "en";
    }

    private String getLocalizedTitle(SuProfile profile) {
        return "th".equals(getCurrentLanguage()) ?
                profile.getTitle().getPrefixNameLocal() : profile.getTitle().getPrefixNameEn();
    }

    private String getLocalizedCountry(SuProfile profile) {
        return "th".equals(getCurrentLanguage()) ?
                profile.getCountry().getCountryNameLocal() : profile.getCountry().getCountryNameEn();
    }

    private String getLocalizedProvince(SuProfile profile) {
        return "th".equals(getCurrentLanguage()) ?
                profile.getProvince().getProvinceNameLocal() : profile.getProvince().getProvinceNameEn();
    }

    private String getLocalizedDistrict(SuProfile profile) {
        return "th".equals(getCurrentLanguage()) ?
                profile.getDistrict().getDistrictNameLocal() : profile.getDistrict().getDistrictNameEn();
    }

    private String getLocalizedSubDistrict(SuProfile profile) {
        return "th".equals(getCurrentLanguage()) ?
                profile.getSubDistrict().getSubDistrictNameLocal() : profile.getSubDistrict().getSubDistrictNameEn();
    }
}