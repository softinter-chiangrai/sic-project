package com.softinter.sicapi.service;

import java.util.UUID;

public interface ProgramAccessService {
    boolean canAccessProgram(String programCode);
    void removeAccessCache(String userId, UUID businessId);
    void removeAccessCacheByBusiness(UUID businessId);
    void removeAllAccessCache();
}
