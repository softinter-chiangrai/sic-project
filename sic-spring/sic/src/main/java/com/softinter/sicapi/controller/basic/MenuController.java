package com.softinter.sicapi.controller.basic;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.response.MenuResponse;
import com.softinter.sicapi.dto.response.ProgramPermissionResponse;
import com.softinter.sicapi.repository.su.SuProgramRepository;
import com.softinter.sicapi.service.CurrentUserService;
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
    private final SuProgramRepository programRepository;
    private final CurrentUserService currentUserService;

    @GetMapping
    @Operation(summary = "Get user menu based on business and permissions")
    public ResponseEntity<List<MenuResponse>> getMenu() {
        // ✅ ไม่ต้องใช้ LanguageUtils อีกต่อไป
        List<MenuResponse> menu = menuService.getMenu();
        return ResponseEntity.ok(menu);
    }

    @GetMapping("/permissions")
    @Operation(summary = "สิทธิ์ add/save/remove/print ของผู้ใช้ต่อโปรแกรม (ใช้ซ่อนปุ่มฝั่งหน้าจอ)")
    public ResponseEntity<List<ProgramPermissionResponse>> getPermissions() {
        var businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(programRepository.findProgramPermissions(businessId, currentUserService.getUserId()));
    }
}
