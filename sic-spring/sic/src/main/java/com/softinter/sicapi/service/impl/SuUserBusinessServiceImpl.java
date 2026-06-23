package com.softinter.sicapi.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.SaveUserBusinessRequest;
import com.softinter.sicapi.dto.response.UserBusinessResponse;
import com.softinter.sicapi.dto.response.UserResponse;
import com.softinter.sicapi.entity.su.SuBusiness;
import com.softinter.sicapi.entity.su.SuProfile;
import com.softinter.sicapi.entity.su.SuUserBusiness;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRepository;
import com.softinter.sicapi.service.SuBusinessService;
import com.softinter.sicapi.service.SuUserBusinessService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SuUserBusinessServiceImpl implements SuUserBusinessService {

    private final SuUserBusinessRepository userBusinessRepository;
    private final SuBusinessService businessService;
    private final SuProfileRepository profileRepository;

    @Override
    public List<UserBusinessResponse> findAll(String userId) {
        List<SuUserBusiness> list;
        if (userId != null) {
            list = userBusinessRepository.findByUserIdAndIsActiveTrue(userId);
        } else {
            list = userBusinessRepository.findAll();
        }
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public Page<UserBusinessResponse> findAll(Specification<SuUserBusiness> spec, Pageable pageable) {
        return userBusinessRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    public SuUserBusiness findById(UUID id) {
        return userBusinessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User business not found"));
    }

    @Override
    public UserBusinessResponse getResponseById(UUID id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional
    public UUID save(SaveUserBusinessRequest request) {
        SuUserBusiness ub;
        if (request.getId() != null) {
            ub = findById(request.getId());
        } else {
            ub = new SuUserBusiness();
        }
        ub.setUserId(request.getUserId());
        ub.setIsActive(request.isActive());
        ub.setIsDefault(request.isDefault());

        if (request.getBusinessId() != null) {
            SuBusiness business = businessService.findById(request.getBusinessId());
            ub.setBusiness(business);
        } else {
            ub.setBusiness(null);
        }

        userBusinessRepository.save(ub);
        return ub.getId();
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        SuUserBusiness ub = findById(id);
        ub.setIsDelete(true);
        ub.setIsActive(false);
        userBusinessRepository.save(ub);
    }

    @Override
    public List<UserBusinessResponse> findByUserId(String userId) {
        return userBusinessRepository.findByUserIdAndIsActiveTrue(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> getAvailableUsers() {
        List<SuUserBusiness> userBusinesses = userBusinessRepository.findAll(); // แนะนำให้กรองที่ active
        return userBusinesses.stream()
                .filter(ub -> ub.getIsActive() != null && ub.getIsActive())
                .map(SuUserBusiness::getUserId)
                .distinct()
                .map(userId -> {
                    SuProfile profile = profileRepository.findByUserId(userId).orElse(null);
                    return UserResponse.builder()
                            .id(userId)
                            .name(profile != null ? profile.getFirstNameEn() + " " + profile.getLastNameEn() : userId)
                            .email(profile != null ? profile.getEmail() : "")
                            .build();
                })
                .collect(Collectors.toList());
    }

    private UserBusinessResponse toResponse(SuUserBusiness ub) {
        UserBusinessResponse response = new UserBusinessResponse();
        response.setId(ub.getId());
        response.setUserId(ub.getUserId());
        if (ub.getBusiness() != null) {
            response.setBusinessId(ub.getBusiness().getId());
            response.setBusinessCode(ub.getBusiness().getBusinessCode());
        }
        response.setActive(Boolean.TRUE.equals(ub.getIsActive()));
        response.setDefault(Boolean.TRUE.equals(ub.getIsDefault()));
        response.setRowVersion(ub.getRowVersion());
        return response;
    }
}