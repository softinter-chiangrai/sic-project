package com.softinter.sicapi.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.softinter.sicapi.dto.response.LovResponse;
import com.softinter.sicapi.dto.response.PaginationResponse;
import com.softinter.sicapi.dto.response.SuUserBusinessMemberResponse;

public interface SuUserBusinessMemberService {

    Page<SuUserBusinessMemberResponse> getMembers(UUID businessId, Pageable pageable);

    PaginationResponse<LovResponse> getComboboxMembers(UUID businessId, String keyword, int pageNumberZeroBased, int pageSize);

    LovResponse getComboboxMemberByValue(UUID businessId, String value);

    SuUserBusinessMemberResponse addMember(UUID businessId, String userId, UUID roleId);

    SuUserBusinessMemberResponse updateMember(UUID userBusinessId, List<UUID> roleIds, Boolean isActive);

    void removeMember(UUID userBusinessId);

    SuUserBusinessMemberResponse getMemberById(UUID userBusinessId);

} 


