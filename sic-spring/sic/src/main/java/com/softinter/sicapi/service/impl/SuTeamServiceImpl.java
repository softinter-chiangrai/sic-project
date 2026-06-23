package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.response.SuTeamMemberResponse;
import com.softinter.sicapi.dto.response.SuTeamResponse;
import com.softinter.sicapi.entity.su.SuTeam;
import com.softinter.sicapi.entity.su.SuTeamMember;
import com.softinter.sicapi.repository.su.SuTeamMemberRepository;
import com.softinter.sicapi.repository.su.SuTeamRepository;
import com.softinter.sicapi.service.SuTeamService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SuTeamServiceImpl implements SuTeamService {

    private final SuTeamRepository suTeamRepository;
    private final SuTeamMemberRepository suTeamMemberRepository;

    // ✅ ดึงหรือสร้างทีมของบริษัท (มีแค่ 1 ทีม)
    @Override
    public SuTeamResponse getOrCreateTeam(UUID businessId) {
        SuTeam team = suTeamRepository.findByBusinessIdAndIsActiveTrue(businessId)
                .stream()
                .findFirst()
                .orElseGet(() -> {
                    // สร้างทีมแรกให้บริษัท
                    SuTeam newTeam = new SuTeam();
                    newTeam.setBusinessId(businessId);
                    newTeam.setTeamCode("TEAM-" + businessId.toString().substring(0, 8));
                    newTeam.setTeamNameEn("Default Team");
                    newTeam.setTeamNameLocal("ทีมหลัก");
                    newTeam.setIsActive(true);
                    return suTeamRepository.save(newTeam);
                });

        return toResponse(team);
    }

    // ✅ ดึงทีมของบริษัท (ถ้ายังไม่มีให้สร้างก่อน)
    private SuTeam getOrCreateTeamEntity(UUID businessId) {
        return suTeamRepository.findByBusinessIdAndIsActiveTrue(businessId)
                .stream()
                .findFirst()
                .orElseGet(() -> {
                    SuTeam newTeam = new SuTeam();
                    newTeam.setBusinessId(businessId);
                    newTeam.setTeamCode("TEAM-" + businessId.toString().substring(0, 8));
                    newTeam.setTeamNameEn("Default Team");
                    newTeam.setTeamNameLocal("ทีมหลัก");
                    newTeam.setIsActive(true);
                    return suTeamRepository.save(newTeam);
                });
    }

    // ✅ รายการสมาชิกในทีมของบริษัท (หน้า pmrt29)
    @Override
    public Page<SuTeamMemberResponse> getTeamMembers(UUID businessId, Pageable pageable) {
        SuTeam team = getOrCreateTeamEntity(businessId);
        return suTeamMemberRepository.findByTeamIdAndIsActiveTrue(team.getId(), pageable)
                .map(this::toMemberResponse);
    }

    // ✅ เพิ่มสมาชิกเข้าทีม (หน้า pmrt29/add)
    @Override
    @Transactional
    public SuTeamMemberResponse addMember(UUID businessId, String userId, String roleInTeam) {
        SuTeam team = getOrCreateTeamEntity(businessId);

        // ตรวจสอบว่าผู้ใช้อยู่ในทีมแล้วหรือยัง
        if (suTeamMemberRepository.existsByTeamIdAndUserId(team.getId(), userId)) {
            throw new RuntimeException("ผู้ใช้นี้เป็นสมาชิกของทีมอยู่แล้ว");
        }

        SuTeamMember member = new SuTeamMember();
        member.setTeam(team);
        member.setUserId(userId);
        member.setRoleInTeam(roleInTeam != null ? roleInTeam : "MEMBER");
        member.setJoinedDate(Instant.now());
        member.setIsActive(true);
        member = suTeamMemberRepository.save(member);

        return toMemberResponse(member);
    }

    // ✅ แก้ไขข้อมูลสมาชิก (หน้า pmrt29/:id/edit)
    @Override
    @Transactional
    public SuTeamMemberResponse updateMember(UUID memberId, String roleInTeam, Boolean isActive) {
        SuTeamMember member = suTeamMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("ไม่พบสมาชิก"));

        if (roleInTeam != null) {
            member.setRoleInTeam(roleInTeam);
        }
        if (isActive != null) {
            member.setIsActive(isActive);
        }

        member = suTeamMemberRepository.save(member);
        return toMemberResponse(member);
    }

    // ✅ ลบสมาชิก (soft delete)
    @Override
    @Transactional
    public void removeMember(UUID memberId) {
        SuTeamMember member = suTeamMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("ไม่พบสมาชิก"));
        member.setIsActive(false);
        suTeamMemberRepository.save(member);
    }

    // ✅ ดึงข้อมูลสมาชิกคนเดียว (สำหรับแก้ไข)
    @Override
    public SuTeamMemberResponse getMemberById(UUID memberId) {
        SuTeamMember member = suTeamMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("ไม่พบสมาชิก"));
        return toMemberResponse(member);
    }

    // ===== Private Helpers =====

    private SuTeamResponse toResponse(SuTeam team) {
        return SuTeamResponse.builder()
                .id(team.getId())
                .businessId(team.getBusinessId())
                .teamCode(team.getTeamCode())
                .teamNameEn(team.getTeamNameEn())
                .teamNameLocal(team.getTeamNameLocal())
                .description(team.getDescription())
                .leaderId(team.getLeaderId())
                .isActive(team.getIsActive())
                .createdDate(team.getCreatedDate())
                .updatedDate(team.getUpdatedDate())
                .build();
    }

    private SuTeamMemberResponse toMemberResponse(SuTeamMember member) {
        return SuTeamMemberResponse.builder()
                .id(member.getId())
                .teamId(member.getTeamId())
                .userId(member.getUserId())
                .roleInTeam(member.getRoleInTeam())
                .isActive(member.getIsActive())
                .joinedDate(member.getJoinedDate())
                .build();
    }
}