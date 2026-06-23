package com.softinter.sicapi.controller.su;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.softinter.sicapi.dto.response.UserResponse;
import com.softinter.sicapi.service.SuUserBusinessService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "User", description = "User API")
public class SuUserController {

    private final SuUserBusinessService userBusinessService;

    @GetMapping("/available")
    @Operation(summary = "Get available users for combobox")
    public ResponseEntity<List<UserResponse>> getAvailableUsers() {
        return ResponseEntity.ok(userBusinessService.getAvailableUsers());
    }
}