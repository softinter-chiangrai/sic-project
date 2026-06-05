package com.softinter.sicapi.controller.auth;

import com.softinter.sicapi.dto.request.*;
import com.softinter.sicapi.dto.response.*;
import com.softinter.sicapi.entity.su.SuProfile;
import com.softinter.sicapi.repository.db.*;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.VerifyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Profile", description = "User Profile API")
public class ProfileController {

    private final SuProfileRepository profileRepository;
    private final DbTitleRepository titleRepository;
    private final DbCountryRepository countryRepository;
    private final DbProvinceRepository provinceRepository;
    private final DbDistrictRepository districtRepository;
    private final DbSubDistrictRepository subDistrictRepository;
    private final CurrentUserService currentUserService;
    private final VerifyService verifyService;

    @GetMapping
    @Operation(summary = "Get user profile info")
    public ResponseEntity<ApiResponse<ProfileResponse>> getInfo() {
        String userId = currentUserService.getUserId();
        SuProfile profile = profileRepository.findByUserIdAndIsActiveTrue(userId)
                .orElse(new SuProfile());
        return ResponseEntity.ok(ApiResponse.success(toResponse(profile)));
    }

    @GetMapping("/activation")
    @Operation(summary = "Check profile activation status")
    public ResponseEntity<ApiResponse<ProfileActivationResponse>> getActivation() {
        String userId = currentUserService.getUserId();
        boolean exists = profileRepository.existsByUserId(userId);
        ProfileActivationResponse response = new ProfileActivationResponse();
        response.setProfileComplete(exists);
        response.setBusinessActive(false);
        response.setMessage(exists ? "Profile is complete" : "Profile is incomplete");
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get my profile")
    public ResponseEntity<ApiResponse<ProfileResponse>> getMe() {
        return getInfo();
    }

    @GetMapping("/mail-check")
    @Operation(summary = "Check if email is registered")
    public ResponseEntity<ApiResponse<Boolean>> mailCheck(@RequestParam String email) {
        return ResponseEntity.ok(ApiResponse.success(true));
    }

    // ✅ แก้ไข: รองรับ personType, value, และภาษา
    @GetMapping("/combobox-title")
    @Operation(summary = "Get title dropdown")
    public ResponseEntity<ApiResponse<List<LovResponse>>> getComboboxTitle(
            @RequestParam(required = false) String personType,
            @RequestParam(required = false) String value,
            @RequestHeader(value = "x-language-code", required = false, defaultValue = "en") String lang
    ) {
        List<LovResponse> titles = titleRepository.findByIsActiveTrueOrderByPrefixNameEn()
                .stream()
                .filter(t -> {
                    if (personType == null || personType.isEmpty()) return true;
                    // ถ้ามี personType field ใน entity ให้ filter
                    // return personType.equals(t.getPersonType());
                    return true; //暂时跳过 filter
                })
                .map(t -> new LovResponse(
                    t.getId(), 
                    "th".equals(lang) ? t.getPrefixNameLocal() : t.getPrefixNameEn()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(titles));
    }

    // ✅ แก้ไข: รองรับ value และภาษา
    @GetMapping("/combobox-country")
    @Operation(summary = "Get country dropdown")
    public ResponseEntity<ApiResponse<List<LovResponse>>> getComboboxCountry(
            @RequestParam(required = false) String value,
            @RequestHeader(value = "x-language-code", required = false, defaultValue = "en") String lang
    ) {
        List<LovResponse> countries = countryRepository.findByIsActiveTrueOrderByCountryNameEn()
                .stream()
                .map(c -> new LovResponse(
                    c.getId(), 
                    "th".equals(lang) ? c.getCountryNameLocal() : c.getCountryNameEn()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(countries));
    }

    // ✅ แก้ไข: รองรับภาษา
    @GetMapping("/combobox-province")
    @Operation(summary = "Get province dropdown")
    public ResponseEntity<ApiResponse<List<LovResponse>>> getComboboxProvince(
            @RequestParam(required = false) UUID countryId,
            @RequestHeader(value = "x-language-code", required = false, defaultValue = "en") String lang
    ) {
        List<LovResponse> provinces;
        if (countryId != null) {
            provinces = provinceRepository.findByCountryIdAndIsActiveTrueOrderByProvinceNameEn(countryId)
                    .stream()
                    .map(p -> new LovResponse(
                        p.getId(), 
                        "th".equals(lang) ? p.getProvinceNameLocal() : p.getProvinceNameEn()
                    ))
                    .collect(Collectors.toList());
        } else {
            provinces = provinceRepository.findByIsActiveTrueOrderByProvinceNameEn()
                    .stream()
                    .map(p -> new LovResponse(
                        p.getId(), 
                        "th".equals(lang) ? p.getProvinceNameLocal() : p.getProvinceNameEn()
                    ))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(ApiResponse.success(provinces));
    }

    // ✅ แก้ไข: รองรับภาษา
    @GetMapping("/combobox-district")
    @Operation(summary = "Get district dropdown")
    public ResponseEntity<ApiResponse<List<LovResponse>>> getComboboxDistrict(
            @RequestParam UUID provinceId,
            @RequestHeader(value = "x-language-code", required = false, defaultValue = "en") String lang
    ) {
        List<LovResponse> districts = districtRepository.findByProvinceIdAndIsActiveTrueOrderByDistrictNameEn(provinceId)
                .stream()
                .map(d -> new LovResponse(
                    d.getId(), 
                    "th".equals(lang) ? d.getDistrictNameLocal() : d.getDistrictNameEn()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(districts));
    }

    // ✅ แก้ไข: รองรับภาษา
    @GetMapping("/combobox-sub-district")
    @Operation(summary = "Get sub-district dropdown")
    public ResponseEntity<ApiResponse<List<LovResponse>>> getComboboxSubDistrict(
            @RequestParam UUID districtId,
            @RequestHeader(value = "x-language-code", required = false, defaultValue = "en") String lang
    ) {
        List<LovResponse> subDistricts = subDistrictRepository.findByDistrictIdAndIsActiveTrueOrderBySubDistrictNameEn(districtId)
                .stream()
                .map(s -> new LovResponse(
                    s.getId(), 
                    "th".equals(lang) ? s.getSubDistrictNameLocal() : s.getSubDistrictNameEn()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(subDistricts));
    }

    @PostMapping("/send-verify")
    @Operation(summary = "Send verification email")
    public ResponseEntity<ApiResponse<VerifyTokenResponse>> sendVerify(@Valid @RequestBody SendVerifyRequest request) {
        // ✅ รองรับทั้ง email และ recipient
        String email = request.getEmail();
        if (email == null || email.trim().isEmpty()) {
            email = request.getRecipient();
        }
        
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is required"));
        }
        
        VerifyTokenResponse response = verifyService.generateVerifyToken(email);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/save")
    @Operation(summary = "Save user profile")
    public ResponseEntity<ApiResponse<UUID>> saveProfile(@Valid @RequestBody SaveProfileRequest request) {
        String userId = currentUserService.getUserId();
        SuProfile profile = profileRepository.findByUserIdAndIsActiveTrue(userId)
                .orElse(new SuProfile());
        profile.setUserId(userId);
        profile.setEmail(request.getEmail());
        profile.setFirstNameEn(request.getFirstNameEn());
        profile.setLastNameEn(request.getLastNameEn());
        profile.setFirstNameLocal(request.getFirstNameLocal());
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
        return ResponseEntity.ok(ApiResponse.success(profile.getId()));
    }

    private ProfileResponse toResponse(SuProfile profile) {
        ProfileResponse response = new ProfileResponse();
        response.setId(profile.getId());
        response.setUserId(profile.getUserId());
        response.setEmail(profile.getEmail());
        response.setFirstNameEn(profile.getFirstNameEn());
        response.setLastNameEn(profile.getLastNameEn());
        response.setFirstNameLocal(profile.getFirstNameLocal());
        response.setLastNameLocal(profile.getLastNameLocal());
        if (profile.getTitle() != null) {
            response.setTitleId(profile.getTitle().getId());
            response.setTitleName("th".equals(getCurrentLanguage()) ? 
                profile.getTitle().getPrefixNameLocal() : profile.getTitle().getPrefixNameEn());
        }
        response.setPhoneNumber(profile.getPhoneNumber());
        response.setAddressEn(profile.getAddressEn());
        response.setAddressLocal(profile.getAddressLocal());
        if (profile.getCountry() != null) {
            response.setCountryId(profile.getCountry().getId());
            response.setCountryName("th".equals(getCurrentLanguage()) ? 
                profile.getCountry().getCountryNameLocal() : profile.getCountry().getCountryNameEn());
        }
        if (profile.getProvince() != null) {
            response.setProvinceId(profile.getProvince().getId());
            response.setProvinceName("th".equals(getCurrentLanguage()) ? 
                profile.getProvince().getProvinceNameLocal() : profile.getProvince().getProvinceNameEn());
        }
        if (profile.getDistrict() != null) {
            response.setDistrictId(profile.getDistrict().getId());
            response.setDistrictName("th".equals(getCurrentLanguage()) ? 
                profile.getDistrict().getDistrictNameLocal() : profile.getDistrict().getDistrictNameEn());
        }
        if (profile.getSubDistrict() != null) {
            response.setSubDistrictId(profile.getSubDistrict().getId());
            response.setSubDistrictName("th".equals(getCurrentLanguage()) ? 
                profile.getSubDistrict().getSubDistrictNameLocal() : profile.getSubDistrict().getSubDistrictNameEn());
        }
        response.setZipCode(profile.getZipCode());
        return response;
    }
    
    // Helper method to get current language from header (you may inject request)
    private String getCurrentLanguage() {
        // You can get from RequestContextHolder or pass as parameter
        return "en"; // Default, should be replaced with actual logic
    }
}