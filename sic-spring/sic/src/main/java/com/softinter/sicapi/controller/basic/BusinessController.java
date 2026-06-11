package com.softinter.sicapi.controller.basic;

import com.softinter.sicapi.dto.request.*;
import com.softinter.sicapi.dto.response.*;
import com.softinter.sicapi.service.BusinessAccessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/business")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Business", description = "Business Management API")
public class BusinessController {

    private final BusinessAccessService businessAccessService;

    @GetMapping
    @Operation(summary = "Get my businesses (default)")
    public ResponseEntity<List<BusinessDto>> getBusinesses() {
        return ResponseEntity.ok(businessAccessService.getMyBusinesses());
    }

    @GetMapping("/my-businesses")
    @Operation(summary = "Get my businesses")
    public ResponseEntity<List<BusinessDto>> getMyBusinesses() {
        return ResponseEntity.ok(businessAccessService.getMyBusinesses());
    }

    @GetMapping("/activation")
    @Operation(summary = "Get business activation status")
    public ResponseEntity<Boolean> getBusinessActivation() {
        return ResponseEntity.ok(businessAccessService.getBusinessActivation());
    }

    @PostMapping("/change")
    @Operation(summary = "Change active business")
    public ResponseEntity<ChangeBusinessResponse> changeBusiness(
            @RequestBody ChangeBusinessRequest request) {
        return ResponseEntity.ok(
                businessAccessService.changeBusiness(request.getBusinessId()));
    }

    @GetMapping("/{businessId}")
    @Operation(summary = "Get business info")
    public ResponseEntity<BusinessDto> getBusinessInfo(@PathVariable UUID businessId) {
        return ResponseEntity.ok(businessAccessService.getBusiness(businessId));
    }
}