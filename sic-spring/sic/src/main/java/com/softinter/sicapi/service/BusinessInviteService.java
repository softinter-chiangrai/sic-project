package com.softinter.sicapi.service;

import java.util.List;
import java.util.UUID;

import com.softinter.sicapi.dto.request.CreateInviteRequest;
import com.softinter.sicapi.dto.response.ComboboxResponse;
import com.softinter.sicapi.dto.response.InviteResponse;
import com.softinter.sicapi.dto.response.JoinBusinessResponse;

public interface BusinessInviteService {
    List<InviteResponse> getInvites();
    UUID createInvite(CreateInviteRequest request);
    void deleteInvite(UUID id);
    List<ComboboxResponse> getComboboxRoles();
    JoinBusinessResponse joinBusiness(String token);
} 
