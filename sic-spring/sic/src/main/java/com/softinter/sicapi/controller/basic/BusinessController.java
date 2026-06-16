package com.softinter.sicapi.controller.basic;

import com.softinter.sicapi.dto.request.*;
import com.softinter.sicapi.dto.response.*;
import com.softinter.sicapi.service.BusinessAccessService;
import com.softinter.sicapi.service.CurrentUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/business")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Business", description = "Business Management API")
public class BusinessController {

    private final BusinessAccessService businessAccessService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @Operation(summary = "Get current active business info")
    public ResponseEntity<BusinessResponseDto> getCurrentBusiness() {
        UUID activeId = businessAccessService.getBusinessId();
        if (activeId == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(businessAccessService.getBusiness(activeId));
    }

    @GetMapping("/my-business")
    @Operation(summary = "Get my business list")
    public ResponseEntity<List<BusinessResponseDto>> getMyBusiness() {
        return ResponseEntity.ok(businessAccessService.getMyBusinesses());
    }

    @GetMapping("/activation")
    @Operation(summary = "Get business activation status")
    public ResponseEntity<Boolean> getBusinessActivation() {
        return ResponseEntity.ok(businessAccessService.getBusinessActivation());
    }

    @PostMapping("/change-business")
    @Operation(summary = "Change active business")
    public ResponseEntity<ChangeBusinessResponse> changeBusiness(
            @RequestBody ChangeBusinessRequest request) {
        return ResponseEntity.ok(
                businessAccessService.changeBusiness(request.getBusinessId()));
    }

    @GetMapping("/business-access")
    @Operation(summary = "Get current business access details")
    public ResponseEntity<BusinessAccessResponse> getBusinessAccess() {
        UUID businessId = businessAccessService.getBusinessId();
        boolean canAccess = businessAccessService.canAccessBusiness(businessId);
        BusinessAccessResponse response = new BusinessAccessResponse();
        response.setBusinessId(businessId);
        response.setCanAccess(canAccess);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/save")
    public ResponseEntity<UUID> saveBusiness(@RequestBody SaveBusinessRequest request) {
    String userId = currentUserService.getUserId();
    UUID id = businessAccessService.saveBusiness(request, userId);
    return ResponseEntity.ok(id);
}

    @GetMapping("/{businessId}")
    @Operation(summary = "Get business info")
    public ResponseEntity<BusinessResponseDto> getBusinessInfo(@PathVariable UUID businessId) {
        return ResponseEntity.ok(businessAccessService.getBusiness(businessId));
    }

    @GetMapping("/lov-person-type")
    @Operation(summary = "Get person type LOV (Individual/Corporate)")
    public ResponseEntity<List<LovResponse>> getLovPersonType() {
        // Hardcoded response (ไม่ต้องแก้ database หรือ frontend)
        List<LovResponse> list = Arrays.asList(
            new LovResponse("INDIVIDUAL", "Individual"),
            new LovResponse("CORPORATE", "Corporate")
        );
        return ResponseEntity.ok(list);
    }
}