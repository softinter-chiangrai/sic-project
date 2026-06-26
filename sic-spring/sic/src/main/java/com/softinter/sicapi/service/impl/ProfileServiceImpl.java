package com.softinter.sicapi.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.softinter.sicapi.dto.request.SaveProfileRequest;
import com.softinter.sicapi.dto.response.ProfileResponse;
import com.softinter.sicapi.dto.response.VerifyTokenResponse;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.enums.FileVisibility;
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
import com.softinter.sicapi.util.LocalizationHelper;
import com.softinter.sicapi.util.UniquenessValidator;

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
    private final VerifyService verifyService;

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
        if (request.getState() == EntityState.MODIFIED.getEntityStateCode()) {
            if (request.getId() == null) {
                throw new IllegalArgumentException("Id is required when state is MODIFIED");
            }
            if (request.getRowVersion() == null) {
                throw new IllegalArgumentException("RowVersion is required when state is MODIFIED");
            }
        }

        // 3. โหลดหรือสร้าง Entity
        SuProfile profile;
        if (request.getState() == EntityState.MODIFIED.getEntityStateCode()) {
            profile = profileRepository.findById(request.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Profile not found with id: " + request.getId()));
            profile.setRowVersion(request.getRowVersion());
        } else {
            profile = new SuProfile();
        }

        // ============================================================
        // 4. ✅ ตรวจสอบความซ้ำของ Email, Phone, Tax ID (ใช้ UniquenessValidator)
        // ============================================================
        UniquenessValidator.validate(
            request.getEmail(),
            profile.getEmail(),
            profileRepository::findByEmailIgnoreCase,
            profile.getId(),
            "Email"
        );

        UniquenessValidator.validate(
            request.getPhoneNumber(),
            profile.getPhoneNumber(),
            profileRepository::findByPhoneNumber,
            profile.getId(),
            "Phone number"
        );

        UniquenessValidator.validate(
            request.getTaxId(),
            profile.getTaxId(),
            profileRepository::findByTaxId,
            profile.getId(),
            "Tax ID"
        );

        // ============================================================
        // 5. ตรวจสอบ Email Verification (เฉพาะเมื่ออีเมลเปลี่ยน)
        // ============================================================
        boolean isEmailChanged = false;
        if (request.getState() == EntityState.ADDED.getEntityStateCode()) {
            isEmailChanged = true;
        } else if (request.getState() == EntityState.MODIFIED.getEntityStateCode()) {
            String oldEmail = profile.getEmail();
            if (oldEmail != null && !oldEmail.equalsIgnoreCase(request.getEmail())) {
                isEmailChanged = true;
            }
        }

        if (isEmailChanged) {
            if (!StringUtils.hasText(request.getReferenceNumber())) {
                throw new IllegalArgumentException("Reference number is missing.");
            }
            if (!StringUtils.hasText(request.getVerifyToken())) {
                throw new IllegalArgumentException("Verification token is missing.");
            }

            VerifyTokenResponse verifyResponse = verifyService.verifyToken(
                "Email",
                request.getReferenceNumber(),
                request.getVerifyToken()
            );

            if (verifyResponse == null || !verifyResponse.getValid()) {
                String errorMsg = (verifyResponse != null && StringUtils.hasText(verifyResponse.getMessage()))
                                    ? verifyResponse.getMessage()
                                    : "Email verification failed.";
                throw new IllegalArgumentException(errorMsg);
            }
        }

        // ============================================================
        // 6. จัดการ UploadGroupId
        // ============================================================
        List<StorageUploadReference> uploadRefs = request.getUploadGroupData() != null ? request.getUploadGroupData() : List.of();
        UUID finalUploadGroupId = resolveUploadGroupId(request.getUploadGroupId(), uploadRefs);
        profile.setUploadGroupId(finalUploadGroupId);

        // ============================================================
        // 7. Mapping ข้อมูล
        // ============================================================
        profile.setUserId(userId);
        profile.setEmail(request.getEmail());
        profile.setFirstNameEn(request.getFirstNameEn());
        profile.setMiddleNameEn(request.getMiddleNameEn());
        profile.setLastNameEn(request.getLastNameEn());
        profile.setFirstNameLocal(request.getFirstNameLocal());
        profile.setMiddleNameLocal(request.getMiddleNameLocal());
        profile.setLastNameLocal(request.getLastNameLocal());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setTaxId(request.getTaxId());
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

        // 8. บันทึก
        profile = profileRepository.save(profile);

        // 9. Sync Uploads
        if (finalUploadGroupId != null && uploadRefs != null && !uploadRefs.isEmpty()) {
            fileStorageService.syncUploads(finalUploadGroupId, uploadRefs);
        }

        return profile.getId();
    }

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

    // ============================================================
    // toResponse - ใช้ LocalizationHelper แทนการเขียน if/else
    // ============================================================
    private ProfileResponse toResponse(SuProfile profile) {
        if (profile == null || profile.getId() == null) return null;

        ProfileResponse response = new ProfileResponse();
        response.setId(profile.getId());

        // ✅ ใช้ LocalizationHelper.getFullName(profile) แทน buildFullName
        response.setName(LocalizationHelper.getFullName(profile));

        response.setTaxId(profile.getTaxId());
        response.setTitleId(profile.getTitleId());

        response.setFirstNameEn(profile.getFirstNameEn());
        response.setMiddleNameEn(profile.getMiddleNameEn());
        response.setLastNameEn(profile.getLastNameEn());
        response.setFirstNameLocal(profile.getFirstNameLocal());
        response.setMiddleNameLocal(profile.getMiddleNameLocal());
        response.setLastNameLocal(profile.getLastNameLocal());

        response.setSupportLocalAddress(profile.getSupportLocalAddress());
        response.setAddressEn(profile.getAddressEn());
        response.setAddressLocal(profile.getAddressLocal());

        response.setCountryId(profile.getCountryId());
        response.setProvinceId(profile.getProvinceId());
        response.setDistrictId(profile.getDistrictId());
        response.setSubDistrictId(profile.getSubDistrictId());
        response.setZipCode(profile.getZipCode());

        response.setEmail(profile.getEmail());
        response.setPhoneNumber(profile.getPhoneNumber());

        response.setRowVersion(profile.getRowVersion());
        response.setState(profile.getState() != null
                ? profile.getState().getEntityStateCode()
                : EntityState.DETACHED.getEntityStateCode());

        UUID uploadGroupId = profile.getUploadGroupId();
        response.setUploadGroupId(uploadGroupId);

        List<StorageUploadReference> uploadData = new ArrayList<>();
        if (uploadGroupId != null) {
            List<SuUpload> uploads = uploadRepository
                    .findAllByUploadGroupIdAndIsActiveTrueOrderByCreatedDateDesc(uploadGroupId);

            for (SuUpload upload : uploads) {
                StorageUploadReference ref = new StorageUploadReference();
                ref.setId(upload.getId());
                ref.setUploadGroupId(uploadGroupId);
                ref.setFileName(upload.getFileName());
                ref.setContentType(upload.getContentType());
                ref.setFileSize(upload.getFileSize());

                // TODO: ทำให้ baseUrl configurable
                String baseUrl = "http://localhost:5265";
                ref.setAccessUrl(baseUrl + "/api/storage/avatar/" + uploadGroupId);

                ref.setState(EntityState.DETACHED.getEntityStateCode());
                ref.setIsActive(upload.getIsActive());
                ref.setIsStreaming(upload.getIsStreaming() != null ? upload.getIsStreaming() : false);
                ref.setVisibility(mapVisibilityToString(upload.getVisibility()));

                uploadData.add(ref);
            }
        }
        response.setUploadGroupData(uploadData);

        return response;
    }

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