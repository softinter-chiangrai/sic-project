package com.softinter.sicapi.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.SaveProfileRequest;
import com.softinter.sicapi.dto.response.ProfileResponse;
import com.softinter.sicapi.dto.response.VerifyTokenResponse;
import com.softinter.sicapi.entity.enums.EntityState;
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
import com.softinter.sicapi.service.VerifyService;

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
    private final VerifyService verifyService;   // เพิ่ม service สำหรับตรวจสอบ email

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getProfileByUserId(String userId) {
        SuProfile profile = profileRepository.findByUserIdAndIsDeleteFalse(userId)
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
        // 1. ตรวจสอบ State (Required)
        if (request.getState() == null) {
            throw new IllegalArgumentException("State must be ADDED or MODIFIED");
        }

        // 2. ตรวจสอบ Id และ RowVersion กรณี MODIFIED
        if (request.getState() == EntityState.MODIFIED) {
            if (request.getId() == null) {
                throw new IllegalArgumentException("Id is required when state is MODIFIED");
            }
            if (request.getRowVersion() == null) {
                throw new IllegalArgumentException("RowVersion is required when state is MODIFIED");
            }
        }

        // 3. โหลดหรือสร้าง Entity
        SuProfile profile;
        if (request.getState() == EntityState.MODIFIED) {
            profile = profileRepository.findById(request.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Profile not found with id: " + request.getId()));
            // ตั้งค่า RowVersion ให้ Hibernate ใช้ตรวจสอบ Optimistic Locking
            profile.setRowVersion(request.getRowVersion());
        } else {
            profile = new SuProfile();
        }

        // 4. ตรวจสอบ Email Verification (เหมือน .NET)
        boolean isEmailChanged = false;
        if (request.getState() == EntityState.ADDED) {
            isEmailChanged = true;
        } else if (request.getState() == EntityState.MODIFIED) {
            String oldEmail = profile.getEmail();
            if (oldEmail != null && !oldEmail.equalsIgnoreCase(request.getEmail())) {
                isEmailChanged = true;
            }
        }

       if (isEmailChanged) {
    if (request.getReferenceNumber() == null || request.getReferenceNumber().isBlank() ||
        request.getVerifyToken() == null || request.getVerifyToken().isBlank()) {
        throw new IllegalArgumentException("ReferenceNumber and VerifyToken are required for email verification.");
    }
    // ✅ แก้ไขการเรียกและตรวจสอบผลลัพธ์
    VerifyTokenResponse verifyResponse = verifyService.verifyToken("Email", request.getReferenceNumber(), request.getVerifyToken());
    if (verifyResponse == null || !verifyResponse.getValid()) {
        throw new IllegalArgumentException("Email verification failed. Invalid token or reference number.");
    }
}

        // 5. จัดการ UploadGroupId (resolve เหมือน .NET)
        List<StorageUploadReference> uploadRefs = request.getUploadGroupData() != null ? request.getUploadGroupData() : List.of();
        UUID finalUploadGroupId = resolveUploadGroupId(request.getUploadGroupId(), uploadRefs);
        profile.setUploadGroupId(finalUploadGroupId);

        // 6. Mapping ข้อมูล
        profile.setUserId(userId);
        profile.setEmail(request.getEmail());
        profile.setFirstNameEn(request.getFirstNameEn());
        profile.setMiddleNameEn(request.getMiddleNameEn());
        profile.setLastNameEn(request.getLastNameEn());
        profile.setFirstNameLocal(request.getFirstNameLocal());
        profile.setMiddleNameLocal(request.getMiddleNameLocal());
        profile.setLastNameLocal(request.getLastNameLocal());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setAddressEn(request.getAddressEn());
        profile.setAddressLocal(request.getAddressLocal());
        profile.setZipCode(request.getZipCode());

        if (request.getTitleId() != null) {
            profile.setTitle(titleRepository.findById(request.getTitleId()).orElse(null));
        } else {
            profile.setTitle(null);
        }
        if (request.getCountryId() != null) {
            profile.setCountry(countryRepository.findById(request.getCountryId()).orElse(null));
        } else {
            profile.setCountry(null);
        }
        if (request.getProvinceId() != null) {
            profile.setProvince(provinceRepository.findById(request.getProvinceId()).orElse(null));
        } else {
            profile.setProvince(null);
        }
        if (request.getDistrictId() != null) {
            profile.setDistrict(districtRepository.findById(request.getDistrictId()).orElse(null));
        } else {
            profile.setDistrict(null);
        }
        if (request.getSubDistrictId() != null) {
            profile.setSubDistrict(subDistrictRepository.findById(request.getSubDistrictId()).orElse(null));
        } else {
            profile.setSubDistrict(null);
        }

        // 7. บันทึก (Hibernate จะตรวจสอบ @Version อัตโนมัติ)
        profile = profileRepository.save(profile);

        // 8. Sync Uploads
        if (finalUploadGroupId != null && uploadRefs != null && !uploadRefs.isEmpty()) {
            fileStorageService.syncUploads(finalUploadGroupId, uploadRefs);
        }

        // 9. คืนค่า UUID เท่านั้น (ตาม .NET)
        return profile.getId();
    }

    /**
     * Helper method: Resolve uploadGroupId คล้ายกับ .NET ResolveUploadGroupId
     */
    private UUID resolveUploadGroupId(UUID existingGroupId, List<StorageUploadReference> references) {
        if (existingGroupId != null) {
            return existingGroupId;
        }
        if (references == null || references.isEmpty()) {
            return null;
        }
        for (StorageUploadReference ref : references) {
            if (ref.getUploadGroupId() != null) {
                return ref.getUploadGroupId();
            }
            if (ref.getId() != null) {
                SuUpload upload = uploadRepository.findById(ref.getId()).orElse(null);
                if (upload != null && upload.getUploadGroupId() != null) {
                    return upload.getUploadGroupId();
                }
            }
        }
        return null;
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