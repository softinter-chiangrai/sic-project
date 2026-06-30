package com.softinter.sicapi.controller.su;

import java.util.List;
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

import com.softinter.sicapi.dto.response.SuUserBusinessMemberResponse;
import com.softinter.sicapi.service.SuUserBusinessMemberService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/su-user-business/members")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "User Business Member", description = "จัดการสมาชิกในธุรกิจ")
public class SuUserBusinessMemberController {

    private final SuUserBusinessMemberService memberService;

    @GetMapping
    @Operation(summary = "ดึงรายชื่อสมาชิกในธุรกิจ (หน้า burt04)")
    public ResponseEntity<Page<SuUserBusinessMemberResponse>> getMembers(
            @RequestParam UUID businessId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(memberService.getMembers(businessId, pageable));
    }

    @PostMapping
    @Operation(summary = "เพิ่มสมาชิกเข้าธุรกิจ")
    public ResponseEntity<SuUserBusinessMemberResponse> addMember(
            @RequestParam UUID businessId,
            @RequestParam String userId,
            @RequestParam(required = false) UUID roleId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(memberService.addMember(businessId, userId, roleId));
    }

    @PutMapping("/{userBusinessId}")
public ResponseEntity<SuUserBusinessMemberResponse> updateMember(
        @PathVariable UUID userBusinessId,
        @RequestParam(required = false) List<UUID> roleIds,  // ✅ เปลี่ยนเป็น List
        @RequestParam(required = false) Boolean isActive) {
    return ResponseEntity.ok(memberService.updateMember(userBusinessId, roleIds, isActive));
}

    @DeleteMapping("/{userBusinessId}")
    @Operation(summary = "ลบสมาชิกออกจากธุรกิจ (soft delete)")
    public ResponseEntity<Void> removeMember(@PathVariable UUID userBusinessId) {
        memberService.removeMember(userBusinessId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuUserBusinessMemberResponse> getMember(@PathVariable UUID id) {
        return ResponseEntity.ok(memberService.getMemberById(id));
    }
}