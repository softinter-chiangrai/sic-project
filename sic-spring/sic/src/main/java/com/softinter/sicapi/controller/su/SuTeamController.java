package com.softinter.sicapi.controller.su;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.softinter.sicapi.dto.response.SuTeamMemberResponse;
import com.softinter.sicapi.dto.response.SuTeamResponse;
import com.softinter.sicapi.service.SuTeamService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/su-team")
@RequiredArgsConstructor
@Tag(name = "SuTeam", description = "API สำหรับจัดการทีม (บริษัทละ 1 ทีม)")
public class SuTeamController {

    private final SuTeamService suTeamService;

    // ===== หน้า pmrt29 (รายการสมาชิก) =====
    @GetMapping("/members")
    @Operation(summary = "ดึงรายชื่อสมาชิกในทีมของบริษัท (หน้า pmrt29)")
    public ResponseEntity<Page<SuTeamMemberResponse>> getMembers(
            @RequestParam UUID businessId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(suTeamService.getTeamMembers(businessId, pageable));
    }

    // ===== หน้า pmrt29/add (เพิ่มสมาชิก) =====
    @PostMapping("/members")
    @Operation(summary = "เพิ่มสมาชิกเข้าทีม (หน้า pmrt29/add)")
    public ResponseEntity<SuTeamMemberResponse> addMember(
            @RequestParam UUID businessId,
            @RequestParam String userId,
            @RequestParam(required = false, defaultValue = "MEMBER") String roleInTeam) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(suTeamService.addMember(businessId, userId, roleInTeam));
    }

    // ===== หน้า pmrt29/:id/edit (แก้ไขสมาชิก) =====
    @PutMapping("/members/{memberId}")
    @Operation(summary = "แก้ไขข้อมูลสมาชิก (หน้า pmrt29/:id/edit)")
    public ResponseEntity<SuTeamMemberResponse> updateMember(
            @PathVariable UUID memberId,
            @RequestParam(required = false) String roleInTeam,
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(suTeamService.updateMember(memberId, roleInTeam, isActive));
    }

    // ===== ลบสมาชิก =====
    @DeleteMapping("/members/{memberId}")
    @Operation(summary = "ลบสมาชิกออกจากทีม (soft delete)")
    public ResponseEntity<Void> removeMember(@PathVariable UUID memberId) {
        suTeamService.removeMember(memberId);
        return ResponseEntity.noContent().build();
    }

    // ===== ดึงข้อมูลสมาชิกคนเดียว (สำหรับแก้ไข) =====
    @GetMapping("/members/{memberId}")
    @Operation(summary = "ดึงข้อมูลสมาชิกคนเดียว")
    public ResponseEntity<SuTeamMemberResponse> getMemberById(@PathVariable UUID memberId) {
        return ResponseEntity.ok(suTeamService.getMemberById(memberId));
    }

    // ===== ดึงข้อมูลทีมของบริษัท =====
    @GetMapping("/team")
    @Operation(summary = "ดึงข้อมูลทีมของบริษัท (สร้างอัตโนมัติถ้ายังไม่มี)")
    public ResponseEntity<SuTeamResponse> getTeam(@RequestParam UUID businessId) {
        return ResponseEntity.ok(suTeamService.getOrCreateTeam(businessId));
    }
}