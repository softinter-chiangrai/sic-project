package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.repository.su.SuUserBusinessRoleRepository;
import com.softinter.sicapi.service.BusinessAccessService;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.ProgramAccessCache;
import com.softinter.sicapi.service.ProgramAccessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProgramAccessServiceImpl implements ProgramAccessService {

    private final SuUserBusinessRoleRepository userBusinessRoleRepository;
    private final CurrentUserService currentUserService;
    private final BusinessAccessService businessAccessService;
    private final ProgramAccessCache programAccessCache;

    @Override
    public boolean canAccessProgram(String programCode) {
        String userId = currentUserService.getUserId();
        UUID businessId = businessAccessService.getBusinessId();

        if (businessId == null || programCode == null || programCode.isBlank()) {
            return false;
        }

        var accessiblePrograms = programAccessCache.getOrCreate(
                userId, businessId,
                () -> new HashSet<>(userBusinessRoleRepository.findAccessibleProgramCodes(userId, businessId))
        );

        return accessiblePrograms.contains(programCode);
    }

    @Override
    public void removeAccessCache(String userId, UUID businessId) {
        programAccessCache.remove(userId, businessId);
    }

    @Override
    public void removeAccessCacheByBusiness(UUID businessId) {
        programAccessCache.removeByBusiness(businessId);
    }

    @Override
    public void removeAllAccessCache() {
        programAccessCache.removeAll();
    }
}
