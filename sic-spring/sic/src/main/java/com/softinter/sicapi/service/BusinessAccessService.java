package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.request.SaveBusinessRequest;
import com.softinter.sicapi.dto.response.BusinessDto;
import com.softinter.sicapi.dto.response.ChangeBusinessResponse;

import java.util.List;
import java.util.UUID;

public interface BusinessAccessService {
    UUID getBusinessId();   // อ่านจาก BusinessContextHolder
    List<BusinessDto> getMyBusinesses();
    ChangeBusinessResponse changeBusiness(UUID businessId);
    boolean getBusinessActivation();
    BusinessDto getBusiness(UUID businessId);
    UUID saveBusiness(SaveBusinessRequest request, String userId); // เรียกตอน create business
    boolean canAccessBusiness(UUID businessId);
}
