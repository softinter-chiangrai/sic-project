package com.softinter.sicapi.controller.basic;

import com.softinter.sicapi.dto.response.LovResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.service.ComboboxService;
import com.softinter.sicapi.util.PaginationUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Combobox", description = "Combobox Data API (Titles, Countries, Provinces, Districts, SubDistricts)")
public class ComboboxController {

    private final ComboboxService comboboxService;

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
}