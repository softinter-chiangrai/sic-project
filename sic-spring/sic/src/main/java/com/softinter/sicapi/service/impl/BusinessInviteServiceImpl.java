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
    private final MailService mailService;  // ✅ inject MailService

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
    }

    @Override
    public List<ComboboxResponse> getComboboxRoles() {
        UUID businessId = BusinessContextHolder.getBusinessId();
        // ✅ ไม่ต้องมี boolean useEnglish แล้ว

        return businessRoleRepository.findByBusinessIdAndIsActiveTrue(businessId)
                .stream()
                .map(role -> {
                    // ✅ ใช้ LocalizationHelper
                    String roleName = LocalizationHelper.getRoleName(role);
                    return new ComboboxResponse(role.getId().toString(), roleName);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public JoinBusinessResponse joinBusiness(String token) {
        String userId = currentUserService.getUserId();
        String userEmail = currentUserService.getEmail();

        // 1. ค้นหา Invite
        SuBusinessInvite invite = businessInviteRepository.findByInviteTokenAndIsDeleteFalse(token)
                .orElseThrow(() -> new IllegalArgumentException("Invite not found or has been revoked."));

        // 2. ตรวจสอบวันหมดอายุ
        if (invite.getExpireAt() != null && invite.getExpireAt().isBefore(Instant.now())) {
            throw new IllegalStateException("This invite has expired.");
        }

        SuBusinessRole role = invite.getSuBusinessRole();
        UUID businessId = role.getBusinessId();

        // 3. ตรวจสอบ Email (เฉพาะ type email)
        if ("email".equalsIgnoreCase(invite.getInviteType())) {
            if (invite.getInviteEmail() == null || !invite.getInviteEmail().equalsIgnoreCase(userEmail)) {
                throw new IllegalArgumentException("This invite is not intended for you.");
            }
            if (Boolean.TRUE.equals(invite.getIsActivated())) {
                throw new IllegalStateException("This email invite has already been used.");
            }
        }

        // 4. ตรวจสอบ maxUses (เฉพาะ type token)
        if ("token".equalsIgnoreCase(invite.getInviteType())) {
            if (invite.getMaxUses() != null && invite.getUseCount() >= invite.getMaxUses()) {
                throw new IllegalStateException("This invite has reached its usage limit.");
            }
        }

        // 5. เพิ่มหรือเปิดใช้งาน UserBusiness
        SuUserBusiness userBusiness = userBusinessRepository.findByUserIdAndBusinessId(userId, businessId)
                .orElse(null);

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

        // 7. อัปเดต Invite
        if ("email".equalsIgnoreCase(invite.getInviteType())) {
            invite.setIsActivated(true);
        }
        invite.setUseCount(invite.getUseCount() + 1);
        invite.setUpdatedBy(userId);
        invite.setUpdatedDate(Instant.now());
        businessInviteRepository.save(invite);

        // 8. ดึงชื่อธุรกิจเพื่อตอบกลับ
        String businessName = businessRepository.findById(businessId)
                .map(SuBusiness::getBusinessCode)
                .orElse("Unknown Business");

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