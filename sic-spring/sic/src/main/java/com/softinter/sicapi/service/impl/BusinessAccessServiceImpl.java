package com.softinter.sicapi.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.SaveBusinessRequest;
import com.softinter.sicapi.dto.response.BusinessDto;
import com.softinter.sicapi.dto.response.ChangeBusinessResponse;
import com.softinter.sicapi.entity.su.SuBusiness;
import com.softinter.sicapi.entity.su.SuBusinessAudit;
import com.softinter.sicapi.entity.su.SuBusinessRole;
import com.softinter.sicapi.entity.su.SuBusinessRoleProgram;
import com.softinter.sicapi.entity.su.SuProgram;
import com.softinter.sicapi.entity.su.SuUserBusiness;
import com.softinter.sicapi.entity.su.SuUserBusinessRole;
import com.softinter.sicapi.repository.db.DbCountryRepository;
import com.softinter.sicapi.repository.db.DbDistrictRepository;
import com.softinter.sicapi.repository.db.DbProvinceRepository;
import com.softinter.sicapi.repository.db.DbSubDistrictRepository;
import com.softinter.sicapi.repository.db.DbTitleRepository;
import com.softinter.sicapi.repository.su.SuBusinessAuditRepository;
import com.softinter.sicapi.repository.su.SuBusinessRepository;
import com.softinter.sicapi.repository.su.SuBusinessRoleProgramRepository;
import com.softinter.sicapi.repository.su.SuBusinessRoleRepository;
import com.softinter.sicapi.repository.su.SuProgramRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRoleRepository;
import com.softinter.sicapi.service.BusinessAccessService;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.NameUtilityService;
import com.softinter.sicapi.service.RequestLanguageProvider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusinessAccessServiceImpl implements BusinessAccessService {

    private final SuUserBusinessRepository userBusinessRepository;
    private final SuBusinessRepository businessRepository;
    private final SuBusinessAuditRepository businessAuditRepository;
    private final SuBusinessRoleRepository businessRoleRepository;
    private final SuProgramRepository programRepository;
    private final SuBusinessRoleProgramRepository businessRoleProgramRepository;
    private final SuUserBusinessRoleRepository userBusinessRoleRepository;
    private final DbTitleRepository titleRepository;
    private final DbCountryRepository countryRepository;
    private final DbProvinceRepository provinceRepository;
    private final DbDistrictRepository districtRepository;
    private final DbSubDistrictRepository subDistrictRepository;
    private final CurrentUserService currentUserService;
    private final RequestLanguageProvider requestLanguageProvider;
    private final NameUtilityService nameUtilityService;

    @Override
    public UUID getBusinessId() {
        return BusinessContextHolder.getBusinessId();
    }

    @Override
    public List<BusinessDto> getMyBusinesses() {
        String userId = currentUserService.getUserId();
        boolean useEnglish = requestLanguageProvider.useEnglish();

        return userBusinessRepository.findActiveByUserId(userId).stream()
                .map(ub -> {
                    SuBusiness business = ub.getBusiness();
                    BusinessDto dto = new BusinessDto();
                    dto.setId(business.getId());
                    dto.setCode(business.getBusinessCode());
                    dto.setDefault(ub.getIsDefault());

                    String name;
                    if (useEnglish) {
                        name = nameUtilityService.joinNames(new String[]{
                                business.getTitle() != null ? business.getTitle().getPrefixNameEn() : null,
                                business.getFirstNameEn(),
                                business.getMiddleNameEn(),
                                business.getLastNameEn(),
                                business.getTitle() != null ? business.getTitle().getSuffixNameEn() : null
                        });
                    } else {
                        name = nameUtilityService.joinNames(new String[]{
                                business.getTitle() != null ? business.getTitle().getPrefixNameLocal() : null,
                                business.getFirstNameLocal(),
                                business.getMiddleNameLocal(),
                                business.getLastNameLocal(),
                                business.getTitle() != null ? business.getTitle().getSuffixNameLocal() : null
                        });
                    }
                    dto.setName(name);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ChangeBusinessResponse changeBusiness(UUID businessId) {
        String userId = currentUserService.getUserId();
        String username = currentUserService.getUsername();
        String sessionId = currentUserService.getSessionId();
        String clientIp = currentUserService.getIpAddress();

        SuUserBusiness userBusiness = userBusinessRepository.findByUserIdAndBusinessId(userId, businessId)
                .orElseThrow(() -> new RuntimeException("User has no access to business_id '" + businessId + "'"));

        userBusinessRepository.updateDefaultBusiness(userId, businessId);

        List<SuBusinessAudit> activeList = businessAuditRepository.findActiveByUserIdAndSessionId(userId, sessionId);
        activeList.forEach(audit -> audit.setIsActive(false));
        businessAuditRepository.saveAll(activeList);

        SuBusinessAudit audit = new SuBusinessAudit();
        audit.setUserId(userId);
        audit.setSessionId(sessionId);
        audit.setUsername(username);
        audit.setBusinessId(businessId);
        audit.setClientIp(clientIp);
        audit.setIsActive(true);
        audit.setRemark("User changed active business from API");
        businessAuditRepository.save(audit);

        SuBusiness business = userBusiness.getBusiness();
        boolean useEnglish = requestLanguageProvider.useEnglish();
        String businessName;
        if (useEnglish) {
            businessName = nameUtilityService.joinNames(new String[]{
                    business.getTitle() != null ? business.getTitle().getPrefixNameEn() : null,
                    business.getFirstNameEn(),
                    business.getMiddleNameEn(),
                    business.getLastNameEn(),
                    business.getTitle() != null ? business.getTitle().getSuffixNameEn() : null
            });
        } else {
            businessName = nameUtilityService.joinNames(new String[]{
                    business.getTitle() != null ? business.getTitle().getPrefixNameLocal() : null,
                    business.getFirstNameLocal(),
                    business.getMiddleNameLocal(),
                    business.getLastNameLocal(),
                    business.getTitle() != null ? business.getTitle().getSuffixNameLocal() : null
            });
        }

        ChangeBusinessResponse response = new ChangeBusinessResponse();
        response.setUserId(userId);
        response.setUsername(username);
        response.setBusinessId(businessId);
        response.setBusinessName(businessName);
        response.setChanged(true);
        return response;
    }

    @Override
    @Transactional
    public boolean getBusinessActivation() {
        String userId = currentUserService.getUserId();
        String sessionId = currentUserService.getSessionId();
        String clientIp = currentUserService.getIpAddress();

        List<UUID> userBusinessIds = userBusinessRepository.findBusinessIdsByUserId(userId);
        if (userBusinessIds.isEmpty()) {
            return false;
        }

        // ✅ แก้ไข: ส่ง userBusinessIds เข้าไป
        List<UUID> recentBySession = businessAuditRepository.findRecentBusinessIdBySession(sessionId, userId, clientIp, userBusinessIds);
        UUID businessToActivate = recentBySession.isEmpty() ? null : recentBySession.get(0);

        if (businessToActivate == null) {
            // ✅ แก้ไข: ส่ง userBusinessIds เข้าไป
            List<UUID> recentByUser = businessAuditRepository.findRecentBusinessIdByUser(userId, userBusinessIds);
            businessToActivate = recentByUser.isEmpty() ? null : recentByUser.get(0);
        }

        if (businessToActivate == null) {
            businessToActivate = userBusinessIds.get(0);
        }

        changeBusiness(businessToActivate);
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessDto getBusiness(UUID businessId) {
        boolean useEnglish = requestLanguageProvider.useEnglish();
         return businessRepository.findByIdWithTitle(businessId)
                .map(business -> {
                    BusinessDto dto = new BusinessDto();
                    dto.setId(business.getId());
                    dto.setCode(business.getBusinessCode());
                    dto.setUploadGroupId(business.getUploadGroupId());

                    String name;
                    if (useEnglish) {
                        name = nameUtilityService.joinNames(new String[]{
                                business.getTitle() != null ? business.getTitle().getPrefixNameEn() : null,
                                business.getFirstNameEn(),
                                business.getMiddleNameEn(),
                                business.getLastNameEn(),
                                business.getTitle() != null ? business.getTitle().getSuffixNameEn() : null
                        });
                    } else {
                        name = nameUtilityService.joinNames(new String[]{
                                business.getTitle() != null ? business.getTitle().getPrefixNameLocal() : null,
                                business.getFirstNameLocal(),
                                business.getMiddleNameLocal(),
                                business.getLastNameLocal(),
                                business.getTitle() != null ? business.getTitle().getSuffixNameLocal() : null
                        });
                    }
                    dto.setName(name);
                    return dto;
                })
                .orElse(null);
    }

   @Override
@Transactional
public UUID saveBusiness(SaveBusinessRequest request, String userId) {
    SuBusiness business;

    if (request.getId() != null) {
        // Update existing business
        business = businessRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Business not found"));
        if (request.getRowVersion() != null) {
            business.setRowVersion(request.getRowVersion());
        }
        updateBusinessFromRequest(business, request);
        businessRepository.save(business);
    } else {
        // Create new business
        business = new SuBusiness();
        business.setIsActive(true);
        business.setIsDelete(false);
        if (request.getBusinessCode() == null || request.getBusinessCode().isBlank()) {
            business.setBusinessCode(generateBusinessCode());
        } else {
            business.setBusinessCode(request.getBusinessCode());
        }
        updateBusinessFromRequest(business, request);

        business = businessRepository.saveAndFlush(business);

        SuUserBusiness userBusiness = new SuUserBusiness();
        userBusiness.setUserId(userId);
        userBusiness.setBusinessId(business.getId());
        userBusiness.setIsActive(true);
        boolean isFirst = userBusinessRepository.countByUserId(userId) == 0;
        userBusiness.setIsDefault(isFirst);
        userBusinessRepository.save(userBusiness);

        SuBusinessRole adminRole = new SuBusinessRole();
        adminRole.setBusiness(business);
        adminRole.setRoleCode("ADMIN");
        adminRole.setRoleNameEn("Administrator");
        adminRole.setRoleNameLocal("ผู้ดูแลระบบ");
        adminRole.setRoleLevel("1");
        adminRole.setSortOrder(1);
        adminRole.setIsActive(true);
        businessRoleRepository.save(adminRole);

        SuUserBusinessRole userRole = new SuUserBusinessRole();
        userRole.setUserBusiness(userBusiness);
        userRole.setBusinessRole(adminRole);
        userRole.setIsPrimary(true);
        userRole.setIsActive(true);
        userBusinessRoleRepository.save(userRole);

        grantBusinessMenuPermissions(adminRole, null);

        // ✅ Activate the newly created business (set as default & active)
        changeBusiness(business.getId());
    }

    return business.getId();
}


// Helper method เพื่อ reuse การ mapping
private void updateBusinessFromRequest(SuBusiness business, SaveBusinessRequest req) {
    business.setTaxId(req.getTaxId());
    business.setBranchCode(req.getBranchCode());
    business.setPersonType(req.getPersonType());
    if (req.getTitleId() != null) {
        business.setTitle(titleRepository.findById(req.getTitleId()).orElse(null));
    }
    business.setFirstNameEn(req.getFirstNameEn());
    business.setMiddleNameEn(req.getMiddleNameEn());
    business.setLastNameEn(req.getLastNameEn());
    business.setFirstNameLocal(req.getFirstNameLocal());
    business.setMiddleNameLocal(req.getMiddleNameLocal());
    business.setLastNameLocal(req.getLastNameLocal());
    if (req.getCountryId() != null) {
        business.setCountry(countryRepository.findById(req.getCountryId()).orElse(null));
    }
    if (req.getProvinceId() != null) {
        business.setProvince(provinceRepository.findById(req.getProvinceId()).orElse(null));
    }
    if (req.getDistrictId() != null) {
        business.setDistrict(districtRepository.findById(req.getDistrictId()).orElse(null));
    }
    if (req.getSubDistrictId() != null) {
        business.setSubDistrict(subDistrictRepository.findById(req.getSubDistrictId()).orElse(null));
    }
    business.setAddressEn(req.getAddressEn());
    business.setAddressLocal(req.getAddressLocal());
    business.setPhoneNumber(req.getPhoneNumber());
    business.setFax(req.getFax());
    business.setEmail(req.getEmail());
    business.setZipCode(req.getZipCode());
    // สำหรับ isActive: new business ถูก set ไว้แล้ว, update ใช้ค่าจาก request (ถ้ามี)
    if (req.getId() != null) {
        // update case: ใช้ค่าที่ request ส่งมา (เผื่อต้องการเปลี่ยน active)
        business.setIsActive(req.isActive());
    }
    if (req.getUploadGroupId() != null) {
        business.setUploadGroupId(req.getUploadGroupId());
    }
}
    private void grantBusinessMenuPermissions(SuBusinessRole role, UUID parentProgramId) {
        List<SuProgram> programs = programRepository.findByParentProgramIdAndIsActiveTrue(parentProgramId);
        for (SuProgram program : programs) {
            if (program.getProgramCode() != null && program.getProgramCode().startsWith("BU")) {
                SuBusinessRoleProgram brp = new SuBusinessRoleProgram();
                brp.setBusinessRole(role);
                brp.setProgram(program);
                brp.setIsActive(true);
                businessRoleProgramRepository.save(brp);
                grantBusinessMenuPermissions(role, program.getId());
            }
        }
    }

    private String generateBusinessCode() {
        return "BUS" + System.currentTimeMillis();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canAccessBusiness(UUID businessId) {
        String userId = currentUserService.getUserId();
        return userBusinessRepository.canAccessBusiness(userId, businessId);
    }
}