package com.softinter.sicapi.controller.auth;

import com.softinter.sicapi.dto.response.AuthMeResponse;
import com.softinter.sicapi.dto.response.ProfileResponse;
import com.softinter.sicapi.service.BusinessAccessService;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.ProfileService; 
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Authentication", description = "Authentication API")
public class AuthController {

    private final CurrentUserService currentUserService;
    private final BusinessAccessService businessAccessService;
    private final ProfileService profileService;  

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user info")
    public ResponseEntity<AuthMeResponse> getMe() {
        String userId = currentUserService.getUserId();
        AuthMeResponse response = new AuthMeResponse();
        response.setUserId(userId);
        response.setUsername(currentUserService.getUsername());

        // ✅ ดึงชื่อที่แปลแล้วจาก Profile
        ProfileResponse profile = profileService.getProfileByUserId(userId);
        if (profile != null && profile.getName() != null && !profile.getName().isBlank()) {
            response.setDisplayName(profile.getName());
        } else {
            response.setDisplayName(currentUserService.getUsername());
        }

        var business = businessAccessService.getBusiness(businessAccessService.getBusinessId());
        if (business != null) {
            response.setCurrentBusinessId(business.getId());
            response.setCurrentBusinessName(business.getName());
        }
        response.setRoles(Collections.emptyList());
        return ResponseEntity.ok(response);
    }
}