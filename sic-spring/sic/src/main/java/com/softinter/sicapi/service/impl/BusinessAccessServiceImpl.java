package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.response.BusinessDto;
import com.softinter.sicapi.dto.response.ChangeBusinessResponse;
import com.softinter.sicapi.entity.su.SuBusinessAudit;
import com.softinter.sicapi.repository.su.SuBusinessAuditRepository;
import com.softinter.sicapi.repository.su.SuBusinessRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRepository;
import com.softinter.sicapi.service.BusinessAccessService;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.NameUtilityService;
import com.softinter.sicapi.service.RequestLanguageProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusinessAccessServiceImpl implements BusinessAccessService {

    private final SuUserBusinessRepository userBusinessRepository;
    private final SuBusinessRepository businessRepository;
    private final SuBusinessAuditRepository businessAuditRepository;
    private final CurrentUserService currentUserService;
    private final RequestLanguageProvider requestLanguageProvider;
    private final NameUtilityService nameUtilityService;

    @Override
    public List<BusinessDto> getMyBusinesses() {
        String userId = currentUserService.getUserId();
        boolean useEnglish = requestLanguageProvider.useEnglish();

        return userBusinessRepository.findActiveByUserId(userId).stream()
                .map(ub -> {
                    BusinessDto dto = new BusinessDto();
                    dto.setId(ub.getBusiness().getId());
                    var business = ub.getBusiness();
                    var title = business.getTitle();
                    String name;
                    if (useEnglish) {
                        name = nameUtilityService.joinNames(new String[]{
                                title != null ? title.getPrefixNameEn() : null,
                                business.getFirstNameEn(),
                                business.getMiddleNameEn(),
                                business.getLastNameEn(),
                                title != null ? title.getSuffixNameEn() : null
                        });
                    } else {
                        name = nameUtilityService.joinNames(new String[]{
                                title != null ? title.getPrefixNameLocal() : null,
                                business.getFirstNameLocal(),
                                business.getMiddleNameLocal(),
                                business.getLastNameLocal(),
                                title != null ? title.getSuffixNameLocal() : null
                        });
                    }
                    dto.setName(name);
                    dto.setDefault(ub.getIsDefault());
                    return dto;
                })
                .toList();
    }

    @Override
    public boolean canAccessBusiness(UUID businessId) {
        String userId = currentUserService.getUserId();
        return userBusinessRepository.canAccessBusiness(userId, businessId);
    }

    @Override
    @Transactional
    public ChangeBusinessResponse changeBusiness(UUID businessId) {
        String userId = currentUserService.getUserId();
        String username = currentUserService.getUsername();
        String sessionId = currentUserService.getSessionId();
        String clientIp = currentUserService.getIpAddress();

        var userBusiness = userBusinessRepository.findByUserIdAndBusinessId(userId, businessId)
                .orElseThrow(() -> new UnauthorizedException("User has no access to business_id '" + businessId + "'"));

        userBusinessRepository.updateDefaultBusiness(userId, businessId);

        List<SuBusinessAudit> activeList = businessAuditRepository.findActiveByUserIdAndSessionId(userId, sessionId);
        for (SuBusinessAudit item : activeList) {
            item.setIsActive(false);
        }
        businessAuditRepository.saveAll(activeList);

        SuBusinessAudit audit = new SuBusinessAudit();
        audit.setUserId(userBusiness.getUserId());
        audit.setSessionId(sessionId);
        audit.setUsername(username);
        audit.setBusinessId(userBusiness.getBusiness().getId());
        audit.setClientIp(clientIp);
        audit.setIsActive(true);
        audit.setRemark("User changed active business from API");
        businessAuditRepository.save(audit);

        boolean useEnglish = requestLanguageProvider.useEnglish();
        var business = userBusiness.getBusiness();
        var title = business.getTitle();
        String businessName;
        if (useEnglish) {
            businessName = nameUtilityService.joinNames(new String[]{
                    title != null ? title.getPrefixNameEn() : null,
                    business.getFirstNameEn(),
                    business.getMiddleNameEn(),
                    business.getLastNameEn(),
                    title != null ? title.getSuffixNameEn() : null
            });
        } else {
            businessName = nameUtilityService.joinNames(new String[]{
                    title != null ? title.getPrefixNameLocal() : null,
                    business.getFirstNameLocal(),
                    business.getMiddleNameLocal(),
                    business.getLastNameLocal(),
                    title != null ? title.getSuffixNameLocal() : null
            });
        }

        ChangeBusinessResponse response = new ChangeBusinessResponse();
        response.setUserId(userId);
        response.setUsername(username);
        response.setBusinessId(userBusiness.getBusiness().getId());
        response.setBusinessName(businessName);
        response.setChanged(true);
        return response;
    }

    @Override
    public UUID getBusinessId() {
        // This is set by BusinessContextFilter
        return BusinessContextHolder.getBusinessId();
    }

    @Override
    public BusinessDto getBusiness(UUID businessId) {
        boolean useEnglish = requestLanguageProvider.useEnglish();
        return businessRepository.findByIdAndIsActiveTrueAndIsDeleteFalse(businessId)
                .map(business -> {
                    BusinessDto dto = new BusinessDto();
                    dto.setId(business.getId());
                    dto.setCode(business.getBusinessCode());
                    var title = business.getTitle();
                    String name;
                    if (useEnglish) {
                        name = nameUtilityService.joinNames(new String[]{
                                title != null ? title.getPrefixNameEn() : null,
                                business.getFirstNameEn(),
                                business.getMiddleNameEn(),
                                business.getLastNameEn(),
                                title != null ? title.getSuffixNameEn() : null
                        });
                    } else {
                        name = nameUtilityService.joinNames(new String[]{
                                title != null ? title.getPrefixNameLocal() : null,
                                business.getFirstNameLocal(),
                                business.getMiddleNameLocal(),
                                business.getLastNameLocal(),
                                title != null ? title.getSuffixNameLocal() : null
                        });
                    }
                    dto.setName(name);
                    dto.setUploadGroupId(business.getUploadGroupId());
                    return dto;
                })
                .orElse(null);
    }

    @Override
    @Transactional
    public boolean getBusinessActivation() {
        String sessionId = currentUserService.getSessionId();
        String clientIp = currentUserService.getIpAddress();
        String userId = currentUserService.getUserId();

        List<UUID> userBusinessIds = userBusinessRepository.findBusinessIdsByUserId(userId);
        if (userBusinessIds.isEmpty()) {
            return false;
        }

        List<UUID> recentBySession = businessAuditRepository.findRecentBusinessIdBySession(sessionId, userId, clientIp, userBusinessIds);
        UUID businessToActivate = recentBySession.isEmpty() ? null : recentBySession.get(0);

        if (businessToActivate == null) {
            List<UUID> recentByUser = businessAuditRepository.findRecentBusinessIdByUser(userId, userBusinessIds);
            businessToActivate = recentByUser.isEmpty() ? null : recentByUser.get(0);
        }

        changeBusiness(businessToActivate != null ? businessToActivate : userBusinessIds.get(0));
        return true;
    }
}
