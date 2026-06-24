package com.softinter.sicapi.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.SaveBusinessRequest;
import com.softinter.sicapi.dto.response.BusinessResponse;
import com.softinter.sicapi.dto.response.BusinessResponseDto;
import com.softinter.sicapi.dto.response.ChangeBusinessResponse;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.ex.StorageUploadReference;
import com.softinter.sicapi.entity.su.SuBusiness;
import com.softinter.sicapi.entity.su.SuBusinessAudit;
import com.softinter.sicapi.entity.su.SuBusinessRole;
import com.softinter.sicapi.entity.su.SuBusinessRoleProgram;
import com.softinter.sicapi.entity.su.SuProgram;
import com.softinter.sicapi.entity.su.SuUpload;
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
import com.softinter.sicapi.repository.su.SuUploadRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRoleRepository;
import com.softinter.sicapi.service.BusinessAccessService;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.FileStorageService;
import com.softinter.sicapi.util.LanguageUtils;
import com.softinter.sicapi.service.NameUtilityService;

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
    private final NameUtilityService nameUtilityService;
    private final FileStorageService fileStorageService;   
    private final SuUploadRepository uploadRepository;

    @Override
    public UUID getBusinessId() {
        return BusinessContextHolder.getBusinessId();
    }

    @Override
    public List<BusinessResponseDto> getMyBusinesses() {
        String userId = currentUserService.getUserId();
        boolean useEnglish = LanguageUtils.useEnglish();

        return userBusinessRepository.findActiveByUserId(userId).stream()
                .map(ub -> {
                    SuBusiness business = ub.getBusiness();
                    BusinessResponseDto dto = new BusinessResponseDto();
                    dto.setId(business.getId());
                    dto.setCode(business.getBusinessCode());
                    dto.setIsDefault(ub.getIsDefault());

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
        boolean useEnglish = LanguageUtils.useEnglish();
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

    log.info("=== getBusinessActivation START ===");
    log.info("userId: {}, sessionId: {}, clientIp: {}", userId, sessionId, clientIp);

    List<UUID> userBusinessIds = userBusinessRepository.findBusinessIdsByUserId(userId);
    log.info("userBusinessIds: {}", userBusinessIds);

    if (userBusinessIds.isEmpty()) {
        log.warn("No business found for user: {}", userId);
        return false;
    }

    List<UUID> recentBySession = businessAuditRepository.findRecentBusinessIdBySession(
        sessionId, userId, clientIp, userBusinessIds
    );
    log.info("recentBySession: {}", recentBySession);

    UUID businessToActivate = recentBySession.isEmpty() ? null : recentBySession.get(0);

    if (businessToActivate == null) {
        List<UUID> recentByUser = businessAuditRepository.findRecentBusinessIdByUser(
            userId, userBusinessIds
        );
        log.info("recentByUser: {}", recentByUser);
        businessToActivate = recentByUser.isEmpty() ? null : recentByUser.get(0);
    }

    if (businessToActivate == null) {
        businessToActivate = userBusinessIds.get(0);
        log.info("Using fallback business: {}", businessToActivate);
    }

    log.info("Activating business: {}", businessToActivate);
    changeBusiness(businessToActivate);
    log.info("=== getBusinessActivation END ===");
    return true;
}

    @Override
    @Transactional(readOnly = true)
    public BusinessResponseDto getBusiness(UUID businessId) {
        boolean useEnglish = LanguageUtils.useEnglish();
         return businessRepository.findByIdWithTitle(businessId)
                .map(business -> {
                    BusinessResponseDto dto = new BusinessResponseDto();
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
                    dto.setIsDefault(false);                          // ตั้งค่า false (ตาม .NET)
                    dto.setUploadGroupData(new ArrayList<>());
                    return dto;
                })
                .orElse(null);
    }

   @Override
@Transactional
public UUID saveBusiness(SaveBusinessRequest request, String userId) {
    // 1. ตรวจสอบ State (ต้องเป็น ADDED หรือ MODIFIED)
    if (request.getState() == null) {
        throw new IllegalArgumentException("State must be ADDED or MODIFIED");
    }

    // 2. ตรวจสอบ Id และ RowVersion กรณี MODIFIED
    if (request.getState() == EntityState.MODIFIED.getEntityStateCode()) {
        if (request.getId() == null) {
            throw new IllegalArgumentException("Id is required when state is MODIFIED");
        }
        if (request.getRowVersion() == null) {
            throw new IllegalArgumentException("RowVersion is required when state is MODIFIED");
        }
    }

    SuBusiness business;

    // 3. กรณี ADDED
    if (request.getState() == EntityState.ADDED.getEntityStateCode()) {
        business = new SuBusiness();
        business.setIsActive(true);
        business.setIsDelete(false);
        if (request.getBusinessCode() == null || request.getBusinessCode().isBlank()) {
            business.setBusinessCode(generateBusinessCode());
        } else {
            business.setBusinessCode(request.getBusinessCode());
        }
        // map ข้อมูล (ใช้ method ช่วย)
        updateBusinessFromRequest(business, request);

        // 4. จัดการ UploadGroupId (resolve ก่อน save)
        List<StorageUploadReference> uploadRefs = request.getUploadGroupData() != null ? request.getUploadGroupData() : List.of();
        UUID finalUploadGroupId = resolveUploadGroupId(request.getUploadGroupId(), uploadRefs);
        business.setUploadGroupId(finalUploadGroupId);

        business = businessRepository.save(business);

        // สร้าง entities ที่เกี่ยวข้อง (เหมือน .NET)
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

        // 5. Sync uploads หลังจาก save (ถ้ามี)
        if (finalUploadGroupId != null && uploadRefs != null && !uploadRefs.isEmpty()) {
            fileStorageService.syncUploads(finalUploadGroupId, uploadRefs);
        }

        // 6. เปลี่ยน business ที่ active (เหมือน .NET)
        changeBusiness(business.getId());

        return business.getId();
    }

    // 7. กรณี MODIFIED
    else if (request.getState() == EntityState.MODIFIED.getEntityStateCode()) {
        // ตรวจสอบสิทธิ์การแก้ไข (เหมือน .NET Validator)
        boolean hasEditPermission = userBusinessRepository.existsByUserIdAndBusinessId(userId, request.getId());
        if (!hasEditPermission) {
            throw new SecurityException("User does not have permission to edit this business.");
        }

        // โหลด business
        business = businessRepository.findById(request.getId())
                .orElseThrow(() -> new IllegalArgumentException("Business not found with id: " + request.getId()));

        // ตั้งค่า RowVersion ให้ Hibernate ตรวจสอบ Optimistic Locking
        business.setRowVersion(request.getRowVersion());

        // จัดการ UploadGroupId ก่อน map
        List<StorageUploadReference> uploadRefs = request.getUploadGroupData() != null ? request.getUploadGroupData() : List.of();
        UUID finalUploadGroupId = resolveUploadGroupId(request.getUploadGroupId(), uploadRefs);
        business.setUploadGroupId(finalUploadGroupId);

        // Map ข้อมูล (mapper.map แบบ .NET)
        updateBusinessFromRequest(business, request);

        // บันทึก (Hibernate จะตรวจสอบ @Version อัตโนมัติ)
        business = businessRepository.save(business);

        // Sync uploads หลังจาก save
        if (finalUploadGroupId != null && uploadRefs != null && !uploadRefs.isEmpty()) {
            fileStorageService.syncUploads(finalUploadGroupId, uploadRefs);
        }

        return business.getId();
    }

    throw new IllegalStateException("Unexpected state: " + request.getState());
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
    business.setSupportLocalAddress(req.isSupportLocalAddress());
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
    private UUID resolveUploadGroupId(UUID existingGroupId, List<StorageUploadReference> references) {
    if (existingGroupId != null) return existingGroupId;
    if (references == null || references.isEmpty()) return null;
    for (StorageUploadReference ref : references) {
        if (ref.getUploadGroupId() != null) return ref.getUploadGroupId();
        if (ref.getId() != null) {
            SuUpload upload = uploadRepository.findById(ref.getId()).orElse(null);
            if (upload != null && upload.getUploadGroupId() != null)
                return upload.getUploadGroupId();
        }
    }
    return null;
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
    @Override
    public BusinessResponse getBusinessInfo(UUID businessId) {
    SuBusiness business = businessRepository.findByIdWithTitle(businessId).orElse(null);
    if (business == null) return null;

    BusinessResponse dto = new BusinessResponse();

    dto.setId(business.getId());
    dto.setTaxId(business.getTaxId());
    dto.setBusinessCode(business.getBusinessCode());
    dto.setBranchCode(business.getBranchCode());
    dto.setPersonType(business.getPersonType());
    dto.setTitleId(business.getTitle() != null ? business.getTitle().getId() : null);
    dto.setFirstNameEn(business.getFirstNameEn());
    dto.setMiddleNameEn(business.getMiddleNameEn());
    dto.setLastNameEn(business.getLastNameEn());
    dto.setFirstNameLocal(business.getFirstNameLocal());
    dto.setMiddleNameLocal(business.getMiddleNameLocal());
    dto.setLastNameLocal(business.getLastNameLocal());
    dto.setCountryId(business.getCountry() != null ? business.getCountry().getId() : null);
    dto.setSupportLocalAddress(business.getSupportLocalAddress());
    dto.setAddressEn(business.getAddressEn());
    dto.setAddressLocal(business.getAddressLocal());
    dto.setProvinceId(business.getProvince() != null ? business.getProvince().getId() : null);
    dto.setDistrictId(business.getDistrict() != null ? business.getDistrict().getId() : null);
    dto.setSubDistrictId(business.getSubDistrict() != null ? business.getSubDistrict().getId() : null);
    dto.setZipCode(business.getZipCode());
    dto.setEmail(business.getEmail());
    dto.setPhoneNumber(business.getPhoneNumber());
    dto.setUploadGroupId(business.getUploadGroupId());
    dto.setUploadGroupData(new ArrayList<>());
    dto.setState(0); // Detached
    dto.setRowVersion(business.getRowVersion());

    return dto;
}
}