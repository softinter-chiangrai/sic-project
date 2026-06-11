package com.softinter.sicapi.controller;

import com.softinter.sicapi.dto.response.*;
import com.softinter.sicapi.service.VerifyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/verify")
@RequiredArgsConstructor
@Tag(name = "Verify", description = "Verification API")
public class VerifyController {

    private final VerifyService verifyService;

    @GetMapping("/token/{token}")
    @Operation(summary = "Verify token")
    public ResponseEntity<VerifyTokenResponse> verifyToken(@PathVariable String token) {
        VerifyTokenResponse response = verifyService.verifyToken(token);
        return ResponseEntity.ok(response);
    }
}
