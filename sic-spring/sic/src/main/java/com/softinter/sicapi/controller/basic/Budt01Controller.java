package com.softinter.sicapi.controller.basic;

import com.softinter.sicapi.dto.request.SaveBusinessRequest;
import com.softinter.sicapi.dto.response.BusinessResponse;
import com.softinter.sicapi.dto.response.LovResponse;
import com.softinter.sicapi.service.BusinessAccessService;
import com.softinter.sicapi.service.ComboboxService;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.util.LanguageUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bu/burt01")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Business Setting (BURT01)", description = "Business Setting API")
// @PreAuthorize("hasAuthority('BURT01')")
public class Budt01Controller {

    private final ComboboxService comboboxService;
    private final BusinessAccessService businessAccessService;
    private final CurrentUserService currentUserService; 

    @GetMapping
    @Operation(summary = "Get business setting info")
    public ResponseEntity<BusinessResponse> getBusinessInfo() {
        UUID businessId = businessAccessService.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.notFound().build();
        }
        BusinessResponse response = businessAccessService.getBusinessInfo(businessId);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/lov-person-type")
    @Operation(summary = "Get person type LOV")
    public ResponseEntity<List<LovResponse>> getLovPersonType() {
        String lang = LanguageUtils.getLanguage();
        return ResponseEntity.ok(comboboxService.getPersonTypeLov(lang));
    }

    @GetMapping("/combobox-title")
    @Operation(summary = "Get title combobox")
    public ResponseEntity<List<LovResponse>> getComboboxTitle(
            @RequestParam(required = false) String personType,
            @RequestParam(required = false) String value) {
        String lang = LanguageUtils.getLanguage();
        return ResponseEntity.ok(comboboxService.getTitleList(personType, value, lang));
    }

    @GetMapping("/combobox-country")
    @Operation(summary = "Get country combobox")
    public ResponseEntity<List<LovResponse>> getComboboxCountry(
            @RequestParam(required = false) String value) {
        String lang = LanguageUtils.getLanguage();
        return ResponseEntity.ok(comboboxService.getCountryList(value, lang));
    }

    @GetMapping("/combobox-province")
    @Operation(summary = "Get province combobox")
    public ResponseEntity<List<LovResponse>> getComboboxProvince(
            @RequestParam(required = false) String countryId,
            @RequestParam(required = false) String value) {
        UUID countryUuid = countryId != null ? UUID.fromString(countryId) : null;
        String lang = LanguageUtils.getLanguage();
        return ResponseEntity.ok(comboboxService.getProvinceList(countryUuid, value, lang));
    }

    @GetMapping("/combobox-district")
    @Operation(summary = "Get district combobox")
    public ResponseEntity<List<LovResponse>> getComboboxDistrict(
            @RequestParam(required = false) String provinceId,
            @RequestParam(required = false) String value) {
        UUID provinceUuid = provinceId != null ? UUID.fromString(provinceId) : null;
        String lang = LanguageUtils.getLanguage();
        return ResponseEntity.ok(comboboxService.getDistrictList(provinceUuid, value, lang));
    }

    @GetMapping("/combobox-sub-district")
    @Operation(summary = "Get sub-district combobox")
    public ResponseEntity<List<LovResponse>> getComboboxSubDistrict(
            @RequestParam(required = false) String districtId,
            @RequestParam(required = false) String value) {
        UUID districtUuid = districtId != null ? UUID.fromString(districtId) : null;
        String lang = LanguageUtils.getLanguage();
        return ResponseEntity.ok(comboboxService.getSubDistrictList(districtUuid, value, lang));
    }

  @PostMapping("/save")
    @Operation(summary = "Save business setting")
    public ResponseEntity<UUID> saveBusinessInfo(@RequestBody SaveBusinessRequest request) {
        String userId = currentUserService.getUserId();
        UUID id = businessAccessService.saveBusiness(request, userId);
        return ResponseEntity.ok(id);
    }
}