package com.softinter.sicapi.controller.basic;

import com.softinter.sicapi.dto.response.MenuResponse;
import com.softinter.sicapi.service.MenuService;
import com.softinter.sicapi.util.LanguageUtils;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Menu", description = "Menu API")
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    @Operation(summary = "Get user menu based on business and permissions")
    public ResponseEntity<List<MenuResponse>> getMenu() {
        boolean useEnglish = LanguageUtils.useEnglish(); 
        List<MenuResponse> menu = menuService.getMenu(useEnglish);
        return ResponseEntity.ok(menu);
    }
}
