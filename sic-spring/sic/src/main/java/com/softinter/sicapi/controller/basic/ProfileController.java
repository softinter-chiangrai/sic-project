package com.softinter.sicapi.controller.basic;

import com.softinter.sicapi.dto.request.SaveProfileRequest;
import com.softinter.sicapi.dto.request.SendVerifyRequest;
import com.softinter.sicapi.dto.response.*;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.ProfileService;
import com.softinter.sicapi.service.VerifyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Profile", description = "User Profile API")
public class ProfileController {

    private final CurrentUserService currentUserService;
    private final VerifyService verifyService;
    private final ProfileService profileService;

    @GetMapping
    @Operation(summary = "Get user profile info")
    public ResponseEntity<ProfileResponse> getInfo() {
        String userId = currentUserService.getUserId();
        return ResponseEntity.ok(profileService.getProfileByUserId(userId));
    }

    @GetMapping("/activation")
    @Operation(summary = "Check profile activation status")
    public ResponseEntity<ApiResponse<ProfileActivationResponse>> getActivation() {
        String userId = currentUserService.getUserId();
        boolean exists = profileService.isProfileComplete(userId);
        ProfileActivationResponse response = new ProfileActivationResponse();
        response.setProfileComplete(exists);
        response.setBusinessActive(false);
        response.setMessage(exists ? "Profile is complete" : "Profile is incomplete");
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get my profile")
    public ResponseEntity<ProfileResponse> getMe() {
        return getInfo();
    }

    @GetMapping("/mail-check")
    @Operation(summary = "Check if email is registered")
    public ResponseEntity<ApiResponse<Boolean>> mailCheck(@RequestParam String email) {
        // TODO: implement real check
        return ResponseEntity.ok(ApiResponse.success(true));
    }

    @PostMapping("/send-verify")
    @Operation(summary = "Send verification email")
    public ResponseEntity<ApiResponse<VerifyTokenResponse>> sendVerify(@Valid @RequestBody SendVerifyRequest request) {
        VerifyTokenResponse response = verifyService.generateVerifyToken(request.getRecipient());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/save")
    @Operation(summary = "Save user profile")
    public ResponseEntity<ApiResponse<UUID>> saveProfile(@Valid @RequestBody SaveProfileRequest request) {
        String userId = currentUserService.getUserId();
        UUID profileId = profileService.saveProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success(profileId));
    }
}