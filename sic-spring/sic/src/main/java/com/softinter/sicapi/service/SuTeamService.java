package com.softinter.sicapi.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.softinter.sicapi.dto.response.SuTeamMemberResponse;
import com.softinter.sicapi.dto.response.SuTeamResponse;

public interface SuTeamService {

    // ✅ ใช้สำหรับหน้า pmrt29 (รายการสมาชิกในทีม)
    Page<SuTeamMemberResponse> getTeamMembers(UUID businessId, Pageable pageable);

    // ✅ ใช้สำหรับหน้า pmrt29/add (เพิ่มสมาชิก)
    SuTeamMemberResponse addMember(UUID businessId, String userId, String roleInTeam);

    // ✅ ใช้สำหรับหน้า pmrt29/:id/edit (แก้ไขสมาชิก)
    SuTeamMemberResponse updateMember(UUID memberId, String roleInTeam, Boolean isActive);

    // ✅ ใช้สำหรับลบสมาชิก (soft delete)
    void removeMember(UUID memberId);

    // ✅ ดึงข้อมูลสมาชิกคนเดียว (สำหรับแก้ไข)
    SuTeamMemberResponse getMemberById(UUID memberId);

    // ✅ ดึงข้อมูลทีมของบริษัท (ถ้ายังไม่มีให้สร้าง)
    SuTeamResponse getOrCreateTeam(UUID businessId);
}