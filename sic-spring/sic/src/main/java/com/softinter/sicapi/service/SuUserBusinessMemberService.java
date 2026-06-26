package com.softinter.sicapi.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.softinter.sicapi.dto.response.SuUserBusinessMemberResponse;

public interface SuUserBusinessMemberService {

    Page<SuUserBusinessMemberResponse> getMembers(UUID businessId, Pageable pageable);

    SuUserBusinessMemberResponse addMember(UUID businessId, String userId, UUID roleId);

    // SuUserBusinessMemberService.java
    SuUserBusinessMemberResponse updateMember(UUID userBusinessId, List<UUID> roleIds, Boolean isActive);

    void removeMember(UUID userBusinessId);

    SuUserBusinessMemberResponse getMemberById(UUID userBusinessId);

    
} 


