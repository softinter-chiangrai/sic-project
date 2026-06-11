package com.softinter.sicapi.service.impl;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.SaveProfileRequest;
import com.softinter.sicapi.dto.response.ProfileResponse;
import com.softinter.sicapi.entity.ex.StorageUploadReference;
import com.softinter.sicapi.entity.su.SuProfile;
import com.softinter.sicapi.entity.su.SuUpload;
import com.softinter.sicapi.repository.db.DbCountryRepository;
import com.softinter.sicapi.repository.db.DbDistrictRepository;
import com.softinter.sicapi.repository.db.DbProvinceRepository;
import com.softinter.sicapi.repository.db.DbSubDistrictRepository;
import com.softinter.sicapi.repository.db.DbTitleRepository;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.repository.su.SuUploadRepository;
import com.softinter.sicapi.service.FileStorageService;
import com.softinter.sicapi.service.ProfileService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final SuProfileRepository profileRepository;
    private final SuUploadRepository uploadRepository;
    private final DbTitleRepository titleRepository;
    private final DbCountryRepository countryRepository;
    private final DbProvinceRepository provinceRepository;
    private final DbDistrictRepository districtRepository;
    private final DbSubDistrictRepository subDistrictRepository;
    private final FileStorageService fileStorageService;

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
    public ProfileResponse saveProfile(String userId, SaveProfileRequest request) {
        log.info("===== uploadGroupData from frontend =====");
        log.info("uploadGroupData size: {}", 
            request.getUploadGroupData() == null ? 0 : request.getUploadGroupData().size());
        
        if (request.getUploadGroupData() != null) {
            for (StorageUploadReference ref : request.getUploadGroupData()) {
                log.info("Ref: id={}, uploadGroupId={}, state={}, isActive={}",
                    ref.getId(), ref.getUploadGroupId(), ref.getState(), ref.getIsActive());
            }
        } else {
            log.info("uploadGroupData is NULL");
        }
        log.info("========================================");

        SuProfile profile = profileRepository.findByUserId(userId)
                .orElse(new SuProfile());

        // กำหนด finalUploadGroupId โดยพยายาม resolve จากหลายแหล่ง
        UUID finalUploadGroupId = request.getUploadGroupId();
        if (finalUploadGroupId == null && request.getUploadGroupData() != null && !request.getUploadGroupData().isEmpty()) {
            StorageUploadReference ref = request.getUploadGroupData().get(0);
            // 1. ถ้า ref มี uploadGroupId อยู่แล้วให้ใช้เลย
            if (ref.getUploadGroupId() != null) {
                finalUploadGroupId = ref.getUploadGroupId();
                log.info("Using uploadGroupId from reference: {}", finalUploadGroupId);
            } 
            // 2. ถ้าไม่มี ให้ใช้ ref.id ค้นหาจาก SuUpload
            else if (ref.getId() != null) {
                log.info("Ref uploadGroupId is null, trying to fetch from SuUpload by id: {}", ref.getId());
                SuUpload upload = uploadRepository.findById(ref.getId()).orElse(null);
                if (upload != null) {
                    finalUploadGroupId = upload.getUploadGroupId();
                    log.info("Resolved uploadGroupId from SuUpload: {}", finalUploadGroupId);
                } else {
                    log.warn("No SuUpload found with id: {}", ref.getId());
                }
            }
        }

        profile.setUploadGroupId(finalUploadGroupId);
        log.info("Final uploadGroupId set to profile: {}", finalUploadGroupId);

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

        if (finalUploadGroupId != null && request.getUploadGroupData() != null && !request.getUploadGroupData().isEmpty()) {
            fileStorageService.syncUploads(finalUploadGroupId, request.getUploadGroupData());
        }

        // Return full response including avatar URL so frontend can update view immediately
        return toResponse(profile);
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

        if (profile.getUploadGroupId() != null) {
            String avatarUrl = fileStorageService.getFileUrlByUploadGroupId(profile.getUploadGroupId());
            response.setAvatarUrl(avatarUrl);
        }

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