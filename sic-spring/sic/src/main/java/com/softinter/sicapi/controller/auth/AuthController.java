package com.softinter.sicapi.controller.auth;

import com.softinter.sicapi.dto.response.ApiResponse;
import com.softinter.sicapi.dto.response.AuthMeResponse;
import com.softinter.sicapi.service.BusinessAccessService;
import com.softinter.sicapi.service.CurrentUserService;
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

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user info")
    public ResponseEntity<ApiResponse<AuthMeResponse>> getMe() {
        AuthMeResponse response = new AuthMeResponse();
        response.setUserId(currentUserService.getUserId());
        response.setUsername(currentUserService.getUsername());
        var business = businessAccessService.getBusiness(businessAccessService.getBusinessId());
        if (business != null) {
            response.setCurrentBusinessId(business.getId());
            response.setCurrentBusinessName(business.getName());
        }
        response.setRoles(Collections.emptyList());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
