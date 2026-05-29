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
        // Implementation based on your requirements
        return ResponseEntity.ok(ApiResponse.success(true));
    }

    @GetMapping("/combobox-title")
    @Operation(summary = "Get title dropdown")
    public ResponseEntity<ApiResponse<List<LovResponse>>> getComboboxTitle() {
        List<LovResponse> titles = titleRepository.findByIsActiveTrueOrderByTitleNameEn()
                .stream()
                .map(t -> new LovResponse(t.getId(), t.getTitleNameEn()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(titles));
    }

    @GetMapping("/combobox-country")
    @Operation(summary = "Get country dropdown")
    public ResponseEntity<ApiResponse<List<LovResponse>>> getComboboxCountry() {
        List<LovResponse> countries = countryRepository.findByIsActiveTrueOrderByCountryNameEn()
                .stream()
                .map(c -> new LovResponse(c.getId(), c.getCountryNameEn()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(countries));
    }

    @GetMapping("/combobox-province")
    @Operation(summary = "Get province dropdown")
    public ResponseEntity<ApiResponse<List<LovResponse>>> getComboboxProvince(@RequestParam(required = false) UUID countryId) {
        List<LovResponse> provinces;
        if (countryId != null) {
            provinces = provinceRepository.findByCountryIdAndIsActiveTrueOrderByProvinceNameEn(countryId)
                    .stream()
                    .map(p -> new LovResponse(p.getId(), p.getProvinceNameEn()))
                    .collect(Collectors.toList());
        } else {
            provinces = provinceRepository.findByIsActiveTrueOrderByProvinceNameEn()
                    .stream()
                    .map(p -> new LovResponse(p.getId(), p.getProvinceNameEn()))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(ApiResponse.success(provinces));
    }

    @GetMapping("/combobox-district")
    @Operation(summary = "Get district dropdown")
    public ResponseEntity<ApiResponse<List<LovResponse>>> getComboboxDistrict(@RequestParam UUID provinceId) {
        List<LovResponse> districts = districtRepository.findByProvinceIdAndIsActiveTrueOrderByDistrictNameEn(provinceId)
                .stream()
                .map(d -> new LovResponse(d.getId(), d.getDistrictNameEn()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(districts));
    }

    @GetMapping("/combobox-sub-district")
    @Operation(summary = "Get sub-district dropdown")
    public ResponseEntity<ApiResponse<List<LovResponse>>> getComboboxSubDistrict(@RequestParam UUID districtId) {
        List<LovResponse> subDistricts = subDistrictRepository.findByDistrictIdAndIsActiveTrueOrderBySubDistrictNameEn(districtId)
                .stream()
                .map(s -> new LovResponse(s.getId(), s.getSubDistrictNameEn()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(subDistricts));
    }

    @PostMapping("/send-verify")
    @Operation(summary = "Send verification email")
    public ResponseEntity<ApiResponse<VerifyTokenResponse>> sendVerify(@Valid @RequestBody SendVerifyRequest request) {
        VerifyTokenResponse response = verifyService.generateVerifyToken(request.getEmail());
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
        profile.setAddress(request.getAddress());
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
            response.setTitleName(profile.getTitle().getTitleNameEn());
        }
        response.setPhoneNumber(profile.getPhoneNumber());
        response.setAddress(profile.getAddress());
        if (profile.getCountry() != null) {
            response.setCountryId(profile.getCountry().getId());
            response.setCountryName(profile.getCountry().getCountryNameEn());
        }
        if (profile.getProvince() != null) {
            response.setProvinceId(profile.getProvince().getId());
            response.setProvinceName(profile.getProvince().getProvinceNameEn());
        }
        if (profile.getDistrict() != null) {
            response.setDistrictId(profile.getDistrict().getId());
            response.setDistrictName(profile.getDistrict().getDistrictNameEn());
        }
        if (profile.getSubDistrict() != null) {
            response.setSubDistrictId(profile.getSubDistrict().getId());
            response.setSubDistrictName(profile.getSubDistrict().getSubDistrictNameEn());
        }
        response.setZipCode(profile.getZipCode());
        response.setVerified(Boolean.TRUE.equals(profile.getIsVerified()));
        return response;
    }
}
