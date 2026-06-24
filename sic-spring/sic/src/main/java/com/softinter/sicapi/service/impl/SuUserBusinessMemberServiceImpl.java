package com.softinter.sicapi.service.impl;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.response.SuUserBusinessMemberResponse;
import com.softinter.sicapi.entity.su.SuBusinessRole;
import com.softinter.sicapi.entity.su.SuUserBusiness;
import com.softinter.sicapi.entity.su.SuUserBusinessRole;
import com.softinter.sicapi.repository.su.SuBusinessRoleRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRoleRepository;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.SuUserBusinessMemberService;

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

    @Override
    @Transactional(readOnly = true)
    public Page<SuUserBusinessMemberResponse> getMembers(UUID businessId, Pageable pageable) {
        return userBusinessRepository.findByBusinessIdAndIsActiveTrue(businessId, pageable)
                .map(this::toResponse);
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
    public SuUserBusinessMemberResponse updateMember(UUID userBusinessId, UUID roleId, Boolean isActive) {
        SuUserBusiness userBusiness = userBusinessRepository.findById(userBusinessId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        if (isActive != null) {
            userBusiness.setIsActive(isActive);
            userBusiness.setUpdatedBy(currentUserService.getUserId());
            userBusiness.setUpdatedDate(Instant.now());
            userBusiness = userBusinessRepository.save(userBusiness);
        }

        if (roleId != null) {
            SuBusinessRole role = businessRoleRepository.findByIdAndBusinessId(roleId, userBusiness.getBusinessId())
                    .orElseThrow(() -> new IllegalArgumentException("Role not found in this business."));

            userBusinessRoleRepository.deleteByUserBusinessId(userBusinessId);

            SuUserBusinessRole userRole = new SuUserBusinessRole();
            userRole.setUserBusiness(userBusiness);
            userRole.setBusinessRole(role);
            userRole.setIsPrimary(false);
            userRole.setIsActive(true);
            userRole.setCreatedBy(currentUserService.getUserId());
            userRole.setCreatedDate(Instant.now());
            userBusinessRoleRepository.save(userRole);
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

    private SuUserBusinessMemberResponse toResponse(SuUserBusiness ub) {
        String roleCode = null;
        String roleName = null;
        SuUserBusinessRole userRole = userBusinessRoleRepository.findFirstByUserBusinessIdAndIsActiveTrue(ub.getId())
                .orElse(null);
        if (userRole != null && userRole.getBusinessRole() != null) {
            roleCode = userRole.getBusinessRole().getRoleCode();
            roleName = userRole.getBusinessRole().getRoleNameLocal();
        }

        return SuUserBusinessMemberResponse.builder()
                .id(ub.getId())
                .businessId(ub.getBusinessId())
                .userId(ub.getUserId())
                .userName(ub.getUserId())
                .userEmail("")
                .roleCode(roleCode)
                .roleName(roleName)
                .isActive(ub.getIsActive())
                .isDefault(ub.getIsDefault())
                .createdDate(ub.getCreatedDate())
                .build();
    }
}