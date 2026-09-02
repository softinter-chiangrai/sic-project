package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.CreateInviteRequest;
import com.softinter.sicapi.dto.response.ComboboxResponse;
import com.softinter.sicapi.dto.response.InviteResponse;
import com.softinter.sicapi.dto.response.JoinBusinessResponse;
import com.softinter.sicapi.entity.su.SuBusiness;
import com.softinter.sicapi.entity.su.SuBusinessInvite;
import com.softinter.sicapi.entity.su.SuBusinessRole;
import com.softinter.sicapi.entity.su.SuUserBusiness;
import com.softinter.sicapi.entity.su.SuUserBusinessRole;
import com.softinter.sicapi.repository.su.SuBusinessInviteRepository;
import com.softinter.sicapi.repository.su.SuBusinessRepository;
import com.softinter.sicapi.repository.su.SuBusinessRoleRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRoleRepository;
import com.softinter.sicapi.service.BusinessInviteService;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.MailService;
import com.softinter.sicapi.service.AuditLogService;
import com.softinter.sicapi.util.LocalizationHelper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusinessInviteServiceImpl implements BusinessInviteService {

    private final SuBusinessInviteRepository businessInviteRepository;
    private final SuBusinessRoleRepository businessRoleRepository;
    private final SuUserBusinessRepository userBusinessRepository;
    private final SuUserBusinessRoleRepository userBusinessRoleRepository;
    private final SuBusinessRepository businessRepository;
    private final CurrentUserService currentUserService;
    private final MailService mailService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public List<InviteResponse> getInvites() {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();

        boolean isMember = userBusinessRepository.existsByUserIdAndBusinessId(userId, businessId);
        if (!isMember) {
            return List.of();
        }

        return businessInviteRepository.findBySuBusinessRole_BusinessIdAndIsDeleteFalse(businessId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UUID createInvite(CreateInviteRequest request) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId = currentUserService.getUserId();

        // ตรวจสอบว่า user เป็นสมาชิกของธุรกิจนี้หรือไม่
        boolean isMember = userBusinessRepository.existsByUserIdAndBusinessId(userId, businessId);
        if (!isMember) {
            throw new SecurityException("You are not a member of the active business.");
        }

        // ตรวจสอบ role
        SuBusinessRole role = businessRoleRepository.findByIdAndBusinessId(request.getRoleId(), businessId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found in this business."));

        // สร้าง Token
        byte[] randomBytes = new byte[24];
        new java.security.SecureRandom().nextBytes(randomBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        // สร้าง Invite
        SuBusinessInvite invite = new SuBusinessInvite();
        invite.setSuBusinessRole(role);
        invite.setBusinessId(role.getBusinessId()); // ✅ แก้ไข: ตั้งค่า business_id เพื่อป้องกัน NOT NULL constraint
        invite.setInviteType(request.getInviteType());
        invite.setInviteEmail(request.getInviteEmail());
        invite.setInviteToken(token);
        invite.setIsActivated(false);
        invite.setMaxUses(request.getMaxUses());
        invite.setUseCount(0);
        invite.setCreatedBy(userId);
        invite.setCreatedDate(Instant.now());

        // ✅ กำหนดวันหมดอายุ (7 วัน)
        invite.setExpireAt(Instant.now().plus(7, ChronoUnit.DAYS));

        businessInviteRepository.save(invite);

        // ✅ ถ้าเป็น Email Invite -> ส่งอีเมล
        if ("email".equalsIgnoreCase(request.getInviteType()) && request.getInviteEmail() != null) {
            mailService.sendTemplatedMail(
                request.getInviteEmail(),
                "BUSINESS_INVITE",     
                token                 
            );
            log.info("✅ Invite email sent to: {}", request.getInviteEmail());
        }

        try {
            auditLogService.log("CREATE_INVITE", "Business Management / Invite",
                    "สร้างคำเชิญเข้าร่วมธุรกิจ: " + (request.getInviteEmail() != null ? request.getInviteEmail() : request.getInviteType()),
                    "BUSINESS_INVITE", invite.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log CREATE_INVITE: {}", e.getMessage(), e);
        }

        return invite.getId();
    }

    @Override
    @Transactional
    public void deleteInvite(UUID id) {
        String userId = currentUserService.getUserId();

        SuBusinessInvite invite = businessInviteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invite not found"));

        UUID businessId = invite.getSuBusinessRole().getBusiness().getId();
        boolean isMember = userBusinessRepository.existsByUserIdAndBusinessId(userId, businessId);
        if (!isMember) {
            throw new SecurityException("You are not a member of this business.");
        }

        invite.setIsDelete(true);
        invite.setDeleteBy(userId);
        invite.setDeleteDate(Instant.now());
        businessInviteRepository.save(invite);

        try {
            auditLogService.log("DELETE_INVITE", "Business Management / Invite",
                    "ยกเลิกคำเชิญเข้าร่วมธุรกิจ",
                    "BUSINESS_INVITE", invite.getId(), null, null, "Success", null);
        } catch (Exception e) {
            log.error("ผิดพลาด audit log DELETE_INVITE: {}", e.getMessage(), e);
        }
    }

    @Override
    public List<ComboboxResponse> getComboboxRoles() {
        UUID businessId = BusinessContextHolder.getBusinessId();

        return businessRoleRepository.findByBusinessIdAndIsActiveTrue(businessId)
                .stream()
                .map(role -> {
                    String roleName = LocalizationHelper.getRoleName(role);
                    return new ComboboxResponse(role.getId().toString(), roleName);
                })
                .collect(Collectors.toList());
    }

    @Override
@Transactional
public JoinBusinessResponse joinBusiness(String token) {
    String userId = currentUserService.getUserId();
    if (userId == null || userId.isBlank()) {
        throw new IllegalArgumentException("Invalid user.");
    }

    // 1. ค้นหา Invite
    SuBusinessInvite invite = businessInviteRepository.findByInviteTokenAndIsDeleteFalse(token)
            .orElseThrow(() -> new IllegalArgumentException("Invite not found or has been revoked."));

    // 2. ตรวจสอบวันหมดอายุ
    if (invite.getExpireAt() != null && invite.getExpireAt().isBefore(Instant.now())) {
        throw new IllegalStateException("This invite has expired.");
    }

    SuBusinessRole role = invite.getSuBusinessRole();
    UUID businessId = role.getBusinessId();

    // 3. ตรวจสอบสถานะ invite (ไม่ตรวจสอบ email)
    if ("email".equalsIgnoreCase(invite.getInviteType())) {
        if (Boolean.TRUE.equals(invite.getIsActivated())) {
            throw new IllegalStateException("This email invite has already been used.");
        }
    }

    if ("token".equalsIgnoreCase(invite.getInviteType())) {
        if (invite.getMaxUses() != null && invite.getUseCount() >= invite.getMaxUses()) {
            throw new IllegalStateException("This invite has reached its usage limit.");
        }
    }

    // ✅ 4. ตรวจสอบว่าผู้ใช้เป็นสมาชิกอยู่แล้วหรือไม่
    SuUserBusiness existingUserBusiness = userBusinessRepository
            .findByUserIdAndBusinessId(userId, businessId)
            .orElse(null);

    if (existingUserBusiness != null && Boolean.TRUE.equals(existingUserBusiness.getIsActive())) {
        // 📌 ผู้ใช้เป็นสมาชิกอยู่แล้ว → ไม่เพิ่ม useCount, ส่งข้อความแจ้งเตือน
        String businessName = businessRepository.findById(businessId)
                .map(SuBusiness::getBusinessCode)
                .orElse("Unknown Business");

        throw new IllegalStateException("You are already a member of this business: " + businessName);
    }

    // 5. ถ้าไม่ใช่สมาชิก หรือเป็น inactive ให้ดำเนินการต่อ
    SuUserBusiness userBusiness = existingUserBusiness;

    if (userBusiness == null) {
        boolean isFirstBusiness = userBusinessRepository.countByUserId(userId) == 0;
        userBusiness = new SuUserBusiness();
        userBusiness.setUserId(userId);
        userBusiness.setBusinessId(businessId);
        userBusiness.setIsDefault(isFirstBusiness);
        userBusiness.setIsActive(true);
        userBusiness.setCreatedBy(userId);
        userBusiness.setCreatedDate(Instant.now());
        userBusiness = userBusinessRepository.save(userBusiness);
    } else {
        // กรณีมีอยู่แต่ inactive → เปิดใช้งานใหม่ (reactivate)
        userBusiness.setIsActive(true);
        userBusiness.setUpdatedBy(userId);
        userBusiness.setUpdatedDate(Instant.now());
        userBusiness = userBusinessRepository.save(userBusiness);
    }

    // 6. กำหนด Role (ถ้ายังไม่มี)
    UUID userBusinessId = userBusiness.getId();
    boolean hasRole = userBusinessRoleRepository.existsByUserBusinessIdAndBusinessRoleId(
            userBusinessId, role.getId());
    if (!hasRole) {
        SuUserBusinessRole userRole = new SuUserBusinessRole();
        userRole.setUserBusiness(userBusiness);
        userRole.setBusinessRole(role);
        userRole.setIsPrimary(true);
        userRole.setIsActive(true);
        userRole.setCreatedBy(userId);
        userRole.setCreatedDate(Instant.now());
        userBusinessRoleRepository.save(userRole);
    }

    // 7. ✅ อัปเดต Invite (เฉพาะเมื่อมีการเข้าร่วมจริง ๆ)
    if ("email".equalsIgnoreCase(invite.getInviteType())) {
        invite.setIsActivated(true);
    }
    invite.setUseCount(invite.getUseCount() + 1);
    invite.setUpdatedBy(userId);
    invite.setUpdatedDate(Instant.now());
    businessInviteRepository.save(invite);

    // 8. ดึงชื่อธุรกิจ
    String businessName = businessRepository.findById(businessId)
            .map(SuBusiness::getBusinessCode)
            .orElse("Unknown Business");

    try {
        auditLogService.log("ACCEPT_INVITE", "Business Management / Invite",
                "ตอบรับคำเชิญเข้าร่วมธุรกิจ: " + businessName,
                "BUSINESS_INVITE", invite.getId(), null, null, "Success", "User: " + userId);
    } catch (Exception e) {
        log.error("ผิดพลาด audit log ACCEPT_INVITE: {}", e.getMessage(), e);
    }

    return JoinBusinessResponse.builder()
            .businessId(businessId)
            .businessName(businessName)
            .message("Joined business successfully.")
            .build();
}

    // ===== Helper =====

    private InviteResponse toResponse(SuBusinessInvite invite) {
        InviteResponse response = new InviteResponse();
        response.setId(invite.getId());
        response.setInviteType(invite.getInviteType());
        response.setInviteEmail(invite.getInviteEmail());
        response.setInviteToken(invite.getInviteToken());
        if (invite.getSuBusinessRole() != null) {
            response.setRoleId(invite.getSuBusinessRole().getId());
            response.setRoleCode(invite.getSuBusinessRole().getRoleCode());
            response.setRoleName(invite.getSuBusinessRole().getRoleNameLocal());
        }
        response.setIsActivated(invite.getIsActivated());
        response.setMaxUses(invite.getMaxUses());
        response.setUseCount(invite.getUseCount());
        response.setCreatedDate(invite.getCreatedDate());
        return response;
    }
}