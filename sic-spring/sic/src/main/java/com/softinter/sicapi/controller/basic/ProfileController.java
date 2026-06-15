package com.softinter.sicapi.controller.basic;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.softinter.sicapi.dto.request.SaveProfileRequest;
import com.softinter.sicapi.dto.request.SendVerifyRequest;
import com.softinter.sicapi.dto.response.ProfileActivationResponse;
import com.softinter.sicapi.dto.response.ProfileResponse;
import com.softinter.sicapi.dto.response.VerifyTokenResponse;
import com.softinter.sicapi.repository.su.SuProfileRepository;  // เพิ่ม import
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.ProfileService;
import com.softinter.sicapi.service.VerifyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Profile", description = "User Profile API")
public class ProfileController {

    private final CurrentUserService currentUserService;
    private final VerifyService verifyService;
    private final ProfileService profileService;
    private final SuProfileRepository profileRepository;  // เพิ่ม repository สำหรับตรวจสอบอีเมล

    @GetMapping
    @Operation(summary = "Get user profile info")
    public ResponseEntity<ProfileResponse> getInfo() {
        String userId = currentUserService.getUserId();
        return ResponseEntity.ok(profileService.getProfileByUserId(userId));
    }

    @GetMapping("/activation")
    @Operation(summary = "Check profile activation status")
    public ResponseEntity<ProfileActivationResponse> getActivation() {
        String userId = currentUserService.getUserId();
        boolean exists = profileService.isProfileComplete(userId);
        ProfileActivationResponse response = new ProfileActivationResponse();
        response.setProfileComplete(exists);
        response.setBusinessActive(false);
        response.setMessage(exists ? "Profile is complete" : "Profile is incomplete");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get my profile")
    public ResponseEntity<ProfileResponse> getMe() {
        return getInfo();
    }

    @GetMapping("/mail-check")
    @Operation(summary = "Check if email is registered")
    public ResponseEntity<Boolean> mailCheck(@RequestParam String email) {
        // ✅ ตรวจสอบจริงว่ามีอีเมลนี้ในระบบหรือไม่ (เหมือน .NET)
        boolean exists = profileRepository.existsByEmailIgnoreCase(email);
        return ResponseEntity.ok(exists);
    }

    @PostMapping("/send-verify")
    @Operation(summary = "Send verification email")
    public ResponseEntity<VerifyTokenResponse> sendVerify(@Valid @RequestBody SendVerifyRequest request) {
        VerifyTokenResponse response = verifyService.generateVerifyToken(request.getRecipient());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/save")
    public ResponseEntity<UUID> saveProfile(@Valid @RequestBody SaveProfileRequest request) {
        String userId = currentUserService.getUserId();
        UUID profileId = profileService.saveProfile(userId, request);
        return ResponseEntity.ok(profileId);
    }
}