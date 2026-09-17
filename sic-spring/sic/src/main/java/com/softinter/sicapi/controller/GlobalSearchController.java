package com.softinter.sicapi.controller;

import com.softinter.sicapi.dto.response.GlobalSearchResponse;
import com.softinter.sicapi.service.BusinessAccessService;
import com.softinter.sicapi.service.GlobalSearchService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Global Search", description = "ค้นหาข้ามทุก Entity สำหรับ Command Palette")
public class GlobalSearchController {

    private final GlobalSearchService globalSearchService;
    private final BusinessAccessService businessAccessService;

    @GetMapping("/global")
    @Operation(summary = "ค้นหาข้าม Entity: ลูกค้า, โครงการ, สัญญา")
    public ResponseEntity<GlobalSearchResponse> globalSearch(
            @RequestParam String q,
            @RequestParam(defaultValue = "8") int limit
    ) {
        UUID businessId = businessAccessService.getBusinessId();
        return ResponseEntity.ok(globalSearchService.search(businessId, q, limit));
    }
}
