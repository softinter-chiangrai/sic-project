package com.softinter.sicapi.controller.basic;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.softinter.sicapi.dto.response.ComboboxResponse;
import com.softinter.sicapi.dto.response.LovResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.service.BusinessInviteService;
import com.softinter.sicapi.service.ComboboxService;
import com.softinter.sicapi.service.SuUserBusinessMemberService;
import com.softinter.sicapi.util.PaginationUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping({"/api/profile", "/api/business"})
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Combobox", description = "Combobox Data API (Titles, Countries, Provinces, Districts, SubDistricts)")
public class ComboboxController {

    private final ComboboxService comboboxService;
    private final BusinessInviteService businessInviteService;
    private final SuUserBusinessMemberService memberService;

    @GetMapping("/combobox-title")
    @Operation(summary = "Get titles (prefix names) with pagination")
    public ResponseEntity<PaginationResponse<LovResponse>> getTitles(
            @RequestParam(required = false) String personType,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID value,
            @RequestParam(name = "pageNumber", defaultValue = "1") int pageNumber,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @RequestHeader(value = "x-language-code", required = false, defaultValue = "en") String lang) {

        int zeroBasedPage = pageNumber - 1;

        if (value != null) {
            LovResponse item = comboboxService.getTitleById(value, lang);
            return ResponseEntity.ok(PaginationUtil.ofSingleItem(item, zeroBasedPage, pageSize));
        }

        return ResponseEntity.ok(comboboxService.getTitles(personType, keyword, zeroBasedPage, pageSize, lang));
    }

    @GetMapping("/combobox-country")
    @Operation(summary = "Get countries with pagination")
    public ResponseEntity<PaginationResponse<LovResponse>> getCountries(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID value,
            @RequestParam(name = "pageNumber", defaultValue = "1") int pageNumber,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @RequestHeader(value = "x-language-code", required = false, defaultValue = "en") String lang) {

        int zeroBasedPage = pageNumber - 1;

        if (value != null) {
            LovResponse item = comboboxService.getCountryById(value, lang);
            return ResponseEntity.ok(PaginationUtil.ofSingleItem(item, zeroBasedPage, pageSize));
        }

        return ResponseEntity.ok(comboboxService.getCountries(keyword, zeroBasedPage, pageSize, lang));
    }

    @GetMapping("/combobox-province")
    @Operation(summary = "Get provinces by countryId with pagination")
    public ResponseEntity<PaginationResponse<LovResponse>> getProvinces(
            @RequestParam(required = false) UUID countryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID value,
            @RequestParam(name = "pageNumber", defaultValue = "1") int pageNumber,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @RequestHeader(value = "x-language-code", required = false, defaultValue = "en") String lang) {

        int zeroBasedPage = pageNumber - 1;

        if (value != null) {
            LovResponse item = comboboxService.getProvinceById(value, lang);
            return ResponseEntity.ok(PaginationUtil.ofSingleItem(item, zeroBasedPage, pageSize));
        }

        return ResponseEntity.ok(comboboxService.getProvinces(countryId, keyword, zeroBasedPage, pageSize, lang));
    }

    @GetMapping("/combobox-district")
    @Operation(summary = "Get districts by provinceId with pagination")
    public ResponseEntity<PaginationResponse<LovResponse>> getDistricts(
            @RequestParam(required = false) UUID provinceId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID value,
            @RequestParam(name = "pageNumber", defaultValue = "1") int pageNumber,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @RequestHeader(value = "x-language-code", required = false, defaultValue = "en") String lang) {

        int zeroBasedPage = pageNumber - 1;

        if (value != null) {
            LovResponse item = comboboxService.getDistrictById(value, lang);
            return ResponseEntity.ok(PaginationUtil.ofSingleItem(item, zeroBasedPage, pageSize));
        }

        return ResponseEntity.ok(comboboxService.getDistricts(provinceId, keyword, zeroBasedPage, pageSize, lang));
    }

    @GetMapping("/combobox-sub-district")
    @Operation(summary = "Get sub-districts by districtId with pagination")
    public ResponseEntity<PaginationResponse<LovResponse>> getSubDistricts(
            @RequestParam UUID districtId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID value,
            @RequestParam(name = "pageNumber", defaultValue = "1") int pageNumber,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
            @RequestHeader(value = "x-language-code", required = false, defaultValue = "en") String lang) {

        int zeroBasedPage = pageNumber - 1;

        if (value != null) {
            LovResponse item = comboboxService.getSubDistrictById(value, lang);
            return ResponseEntity.ok(PaginationUtil.ofSingleItem(item, zeroBasedPage, pageSize));
        }

        return ResponseEntity.ok(comboboxService.getSubDistricts(districtId, keyword, zeroBasedPage, pageSize, lang));
    }

    @GetMapping("/combobox-role")
    @Operation(summary = "Get business roles for combobox ")
    public ResponseEntity<List<ComboboxResponse>> getComboboxRoles() {
        return ResponseEntity.ok(businessInviteService.getComboboxRoles());
    }

    @GetMapping("/combobox-members")
    @Operation(summary = "Get business members for combobox ")
    public ResponseEntity<PaginationResponse<LovResponse>> getComboboxMembers(
        @RequestParam UUID businessId,
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String value,
        @RequestParam(name = "pageNumber", defaultValue = "1") int pageNumber,
        @RequestParam(name = "pageSize", defaultValue = "10") int pageSize) {
    int zeroBasedPage = pageNumber - 1;

    if (value != null && !value.isBlank()) {
        LovResponse item = memberService.getComboboxMemberByValue(businessId, value);
        return ResponseEntity.ok(PaginationUtil.ofSingleItem(item, zeroBasedPage, pageSize));
    }

    return ResponseEntity.ok(memberService.getComboboxMembers(businessId, keyword, zeroBasedPage, pageSize));
}
}