package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.response.SuUserBusinessMemberResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface SuUserBusinessMemberService {

    Page<SuUserBusinessMemberResponse> getMembers(UUID businessId, Pageable pageable);

    SuUserBusinessMemberResponse addMember(UUID businessId, String userId, UUID roleId);

    SuUserBusinessMemberResponse updateMember(UUID userBusinessId, UUID roleId, Boolean isActive);

    void removeMember(UUID userBusinessId);
} 


