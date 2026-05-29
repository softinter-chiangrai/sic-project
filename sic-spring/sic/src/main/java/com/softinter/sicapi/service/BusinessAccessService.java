package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.response.BusinessDto;
import com.softinter.sicapi.dto.response.ChangeBusinessResponse;

import java.util.List;
import java.util.UUID;

public interface BusinessAccessService {
    List<BusinessDto> getMyBusinesses();
    boolean canAccessBusiness(UUID businessId);
    ChangeBusinessResponse changeBusiness(UUID businessId);
    UUID getBusinessId();
    BusinessDto getBusiness(UUID businessId);
    boolean getBusinessActivation();
}
