package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.response.LovResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.dto.response.SuUserBusinessMemberResponse;
import com.softinter.sicapi.entity.su.SuBusinessRole;
import com.softinter.sicapi.entity.su.SuProfile;
import com.softinter.sicapi.entity.su.SuUserBusiness;
import com.softinter.sicapi.entity.su.SuUserBusinessRole;
import com.softinter.sicapi.repository.su.SuBusinessRoleRepository;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRoleRepository;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.SuUserBusinessMemberService;
import com.softinter.sicapi.util.LocalizationHelper;  // ✅ import
import com.softinter.sicapi.util.PaginationUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SuUserBusinessMemberServiceImpl implements SuUserBusinessMemberService {

    private final SuUserBusinessRepository userBusinessRepository;
    private final SuUserBusinessRoleRepository userBusinessRoleRepository;
    private final SuBusinessRoleRepository businessRoleRepository;
    private final CurrentUserService currentUserService;
    private final SuProfileRepository profileRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<SuUserBusinessMemberResponse> getMembers(UUID businessId, Pageable pageable) {
        Page<SuUserBusiness> entityPage = userBusinessRepository.findByBusinessIdAndIsActiveTrue(businessId, pageable);
        return entityPage.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<LovResponse> getComboboxMembers(UUID businessId, String keyword, int pageNumberZeroBased, int pageSize) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(pageNumberZeroBased, pageSize);
        Page<SuUserBusiness> entityPage = userBusinessRepository.findByBusinessIdAndIsActiveTrue(businessId, pageable);

        List<LovResponse> items = entityPage.getContent().stream().map(ub -> {
            SuProfile profile = profileRepository.findByUserId(ub.getUserId()).orElse(null);
            String displayName = ub.getUserId();
            if (profile != null) {
                String fullName = LocalizationHelper.getFullName(profile);
                if (fullName != null && !fullName.isBlank()) {
                    displayName = fullName;
                }
            }
            return new LovResponse(displayName, displayName);
        }).toList();

        return PaginationUtil.of(items, pageNumberZeroBased, pageSize, entityPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public LovResponse getComboboxMemberByValue(UUID businessId, String value) {
        List<SuUserBusiness> allMembers = userBusinessRepository.findByBusinessIdAndIsActiveTrue(businessId);
        for (SuUserBusiness ub : allMembers) {
            SuProfile profile = profileRepository.findByUserId(ub.getUserId()).orElse(null);
            String displayName = ub.getUserId();
            if (profile != null) {
                String fullName = LocalizationHelper.getFullName(profile);
                if (fullName != null && !fullName.isBlank()) {
                    displayName = fullName;
                }
            }
            if (displayName.equals(value)) {
                return new LovResponse(displayName, displayName);
            }
        }
        return new LovResponse(value, value);
    }

    @Override
    @Transactional
    public SuUserBusinessMemberResponse addMember(UUID businessId, String userId, UUID roleId) {
        SuUserBusiness userBusiness = userBusinessRepository.findByUserIdAndBusinessId(userId, businessId)
                .orElse(null);

        if (userBusiness == null) {
            boolean isFirstBusiness = userBusinessRepository.countByUserId(userId) == 0;
            userBusiness = new SuUserBusiness();
            userBusiness.setUserId(userId);
            userBusiness.setBusinessId(businessId);
            userBusiness.setIsDefault(isFirstBusiness);
            userBusiness.setIsActive(true);
            userBusiness.setCreatedBy(currentUserService.getUserId());
            userBusiness.setCreatedDate(Instant.now());
            userBusiness = userBusinessRepository.save(userBusiness);
        } else {
            userBusiness.setIsActive(true);
            userBusiness.setUpdatedBy(currentUserService.getUserId());
            userBusiness.setUpdatedDate(Instant.now());
            userBusiness = userBusinessRepository.save(userBusiness);
        }

        if (roleId != null) {
            SuBusinessRole role = businessRoleRepository.findByIdAndBusinessId(roleId, businessId)
                    .orElseThrow(() -> new IllegalArgumentException("Role not found in this business."));

            boolean hasRole = userBusinessRoleRepository.existsByUserBusinessIdAndBusinessRoleId(
                    userBusiness.getId(), roleId);
            if (!hasRole) {
                SuUserBusinessRole userRole = new SuUserBusinessRole();
                userRole.setUserBusiness(userBusiness);
                userRole.setBusinessRole(role);
                userRole.setIsPrimary(false);
                userRole.setIsActive(true);
                userRole.setCreatedBy(currentUserService.getUserId());
                userRole.setCreatedDate(Instant.now());
                userBusinessRoleRepository.save(userRole);
            }
        }

        return toResponse(userBusiness);
    }

    @Override
    @Transactional
    public SuUserBusinessMemberResponse updateMember(UUID userBusinessId, List<UUID> roleIds, Boolean isActive) {
        SuUserBusiness userBusiness = userBusinessRepository.findById(userBusinessId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        if (isActive != null) {
            userBusiness.setIsActive(isActive);
            userBusiness.setUpdatedBy(currentUserService.getUserId());
            userBusiness.setUpdatedDate(Instant.now());
            userBusiness = userBusinessRepository.save(userBusiness);
        }

        if (roleIds != null && !roleIds.isEmpty()) {
            // ลบบทบาทเก่าทั้งหมด
            userBusinessRoleRepository.deleteByUserBusinessId(userBusinessId);

            // เพิ่มบทบาทใหม่ทั้งหมด
            for (UUID roleId : roleIds) {
                SuBusinessRole role = businessRoleRepository.findByIdAndBusinessId(roleId, userBusiness.getBusinessId())
                        .orElseThrow(() -> new IllegalArgumentException("Role not found in this business: " + roleId));

                SuUserBusinessRole userRole = new SuUserBusinessRole();
                userRole.setUserBusiness(userBusiness);
                userRole.setBusinessRole(role);
                userRole.setIsPrimary(false);
                userRole.setIsActive(true);
                userRole.setCreatedBy(currentUserService.getUserId());
                userRole.setCreatedDate(Instant.now());
                userBusinessRoleRepository.save(userRole);
            }
        }

        return toResponse(userBusiness);
    }

    @Override
    @Transactional
    public void removeMember(UUID userBusinessId) {
        SuUserBusiness userBusiness = userBusinessRepository.findById(userBusinessId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        userBusiness.setIsActive(false);
        userBusiness.setIsDelete(true);
        userBusiness.setDeleteBy(currentUserService.getUserId());
        userBusiness.setDeleteDate(Instant.now());
        userBusinessRepository.save(userBusiness);

        userBusinessRoleRepository.deleteByUserBusinessId(userBusinessId);
        log.info("Member removed: {}", userBusinessId);
    }

    // ============================================================
    // ✅ toResponse - ใช้ LocalizationHelper แทน if/else
    // ============================================================
    private SuUserBusinessMemberResponse toResponse(SuUserBusiness ub) {
        // 1. ดึง Profile
        SuProfile profile = profileRepository.findByUserId(ub.getUserId()).orElse(null);

        String displayName = ub.getUserId();
        String email = "";

        if (profile != null) {
            // ✅ ใช้ LocalizationHelper.getFullName(profile)
            String fullName = LocalizationHelper.getFullName(profile);
            if (fullName != null && !fullName.isBlank()) {
                displayName = fullName;
            }
            email = profile.getEmail() != null ? profile.getEmail() : "";
        }

        // 2. ดึง Role Names (หลายบทบาท)
        List<String> roleIds = new ArrayList<>();
        List<String> roleNames = new ArrayList<>();

        List<SuUserBusinessRole> userRoles = userBusinessRoleRepository
                .findByUserBusinessIdAndIsActiveTrue(ub.getId());

        if (userRoles != null && !userRoles.isEmpty()) {
            for (SuUserBusinessRole userRole : userRoles) {
                if (userRole.getBusinessRole() != null) {
                    roleIds.add(userRole.getBusinessRole().getId().toString());
                    // ✅ ใช้ LocalizationHelper.getRoleName(role)
                    roleNames.add(LocalizationHelper.getRoleName(userRole.getBusinessRole()));
                }
            }
        }

        return SuUserBusinessMemberResponse.builder()
                .id(ub.getId())
                .businessId(ub.getBusinessId())
                .userId(ub.getUserId())
                .userName(displayName)
                .userEmail(email)
                .roleIds(roleIds)
                .roleNames(roleNames)
                .isActive(ub.getIsActive())
                .isDefault(ub.getIsDefault())
                .createdDate(ub.getCreatedDate())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SuUserBusinessMemberResponse getMemberById(UUID userBusinessId) {
        SuUserBusiness userBusiness = userBusinessRepository.findById(userBusinessId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with id: " + userBusinessId));
        return toResponse(userBusiness);
    }
}