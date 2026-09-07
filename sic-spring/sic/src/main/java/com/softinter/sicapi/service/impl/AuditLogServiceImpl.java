package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.AuditLogRequest;
import com.softinter.sicapi.dto.response.AuditLogResponse;
import com.softinter.sicapi.dto.response.AuditLogUserResponse;
import com.softinter.sicapi.entity.su.SuAuditLog;
import com.softinter.sicapi.entity.su.SuProfile;
import com.softinter.sicapi.entity.su.SuUserBusiness;
import com.softinter.sicapi.repository.su.SuAuditLogRepository;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRepository;
import com.softinter.sicapi.service.AuditLogService;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.util.LocalizationHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final SuAuditLogRepository auditLogRepository;
    private final CurrentUserService currentUserService;
    private final SuProfileRepository profileRepository;
    private final SuUserBusinessRepository userBusinessRepository;

    @Override
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAsync(AuditLogRequest request) {
        try {
            SuAuditLog entity = new SuAuditLog();
            entity.setUserId(request.getUserId());
            entity.setUsername(request.getUsername());
            entity.setUserFullname(request.getUserFullname() != null ? request.getUserFullname() : request.getUsername());
            entity.setAction(request.getAction());
            entity.setModule(request.getModule());
            entity.setDescription(request.getDescription());
            entity.setTargetType(request.getTargetType());
            entity.setTargetId(request.getTargetId());
            entity.setOldValue(request.getOldValue());
            entity.setNewValue(request.getNewValue());
            entity.setIpAddress(request.getIpAddress());
            entity.setUserAgent(request.getUserAgent());
            entity.setStatus(request.getStatus() != null ? request.getStatus() : "Success");
            entity.setDetails(request.getDetails());
            entity.setBusinessId(request.getBusinessId());

            auditLogRepository.save(entity);
            log.debug("AuditLog saved: action={}, module={}, user={}", request.getAction(), request.getModule(), request.getUsername());
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void log(String action, String module, String description, String status, String details) {
        log(action, module, description, null, null, null, null, status, details);
    }

    @Override
    @Transactional
    public void log(String action, String module, String description, String targetType, UUID targetId, String oldValue, String newValue, String status, String details) {
        AuditLogRequest request = new AuditLogRequest();
        String currentUserId = null;
        try {
            currentUserId = currentUserService.getUserId();
            request.setUserId(currentUserId);
        } catch (Exception e) {
            request.setUserId("system");
        }
        try {
            request.setUsername(currentUserService.getUsername());
        } catch (Exception e) {
            request.setUsername("system");
        }
        try {
            if (currentUserId != null && !currentUserId.isBlank() && !"system".equalsIgnoreCase(currentUserId)) {
                SuProfile profile = profileRepository.findByUserId(currentUserId).orElse(null);
                if (profile != null) {
                    String fullName = LocalizationHelper.getFullName(profile);
                    request.setUserFullname((fullName != null && !fullName.isBlank()) ? fullName : currentUserService.getUsername());
                } else {
                    request.setUserFullname(currentUserService.getUsername());
                }
            } else {
                request.setUserFullname(currentUserService.getUsername());
            }
        } catch (Exception e) {
            request.setUserFullname("system");
        }
        try {
            request.setIpAddress(currentUserService.getIpAddress());
        } catch (Exception e) {
            request.setIpAddress("unknown");
        }
        try {
            request.setBusinessId(currentUserService.getBusinessId());
        } catch (Exception e) {
            request.setBusinessId(null);
        }

        request.setAction(action);
        request.setModule(module);
        request.setDescription(description);
        request.setTargetType(targetType);
        request.setTargetId(targetId);
        request.setOldValue(oldValue);
        request.setNewValue(newValue);
        request.setStatus(status != null ? status : "Success");
        request.setDetails(details);

        logAsync(request);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getLogs(String searchTerm, String module, String status, String username, int page, int size, String sortBy, String sortDir) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir != null ? sortDir : "DESC"), sortBy != null ? sortBy : "createdDate");
        Pageable pageable = PageRequest.of(page > 0 ? page - 1 : 0, size > 0 ? size : 10, sort);

        return auditLogRepository.searchLogs(searchTerm, module, status, username, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getDistinctModules() {
        Set<String> modules = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);

        List<String> loggedModules = auditLogRepository.findDistinctModules();
        if (loggedModules != null) {
            loggedModules.stream()
                    .filter(m -> m != null && !m.isBlank())
                    .forEach(modules::add);
        }

        if (modules.isEmpty()) {
            modules.addAll(List.of(
                    "Authentication",
                    "Customer Management",
                    "Contract Management",
                    "Project Management",
                    "Requirement Management",
                    "Change Control",
                    "DFD Designer",
                    "ER Designer",
                    "Specification Management",
                    "Design Review",
                    "Planning & Task",
                    "Task Tracking",
                    "Test Management",
                    "Bug Management",
                    "Delivery Management",
                    "User Manual",
                    "Invoice & Payment",
                    "MA Support Ticket",
                    "Renewal / Extension",
                    "Approval Center",
                    "Dashboard & Report",
                    "Document Version Control",
                    "Audit Log",
                    "User Management"
            ));
        }

        return new ArrayList<>(modules);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogUserResponse> getDistinctUsers() {
        UUID currentBusinessId = null;
        try {
            currentBusinessId = currentUserService.getBusinessId();
        } catch (Exception ignored) {}

        Map<String, AuditLogUserResponse> userMap = new LinkedHashMap<>();

        // 1. ดึงสมาชิกจาก Team (SuUserBusiness) ของ Business ปัจจุบัน
        if (currentBusinessId != null) {
            try {
                List<SuUserBusiness> members = userBusinessRepository.findByBusinessIdAndIsActiveTrue(currentBusinessId);
                for (SuUserBusiness member : members) {
                    String userId = member.getUserId();
                    if (userId != null && !userId.isBlank()) {
                        SuProfile profile = profileRepository.findByUserId(userId).orElse(null);
                        String fullName = profile != null ? LocalizationHelper.getFullName(profile) : null;
                        String displayName = (fullName != null && !fullName.isBlank()) ? fullName : userId;
                        userMap.put(userId, new AuditLogUserResponse(userId, displayName, userId));
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to load business team members for audit filter: {}", e.getMessage());
            }
        }

        // 2. ถ้าใน business ยังไม่มี ให้ fallback ไปที่ SuProfile ทั้งหมด
        if (userMap.isEmpty()) {
            try {
                List<SuProfile> profiles = profileRepository.findAll();
                for (SuProfile profile : profiles) {
                    if (profile.getUserId() != null && !profile.getUserId().isBlank()) {
                        String fullName = LocalizationHelper.getFullName(profile);
                        String userId = profile.getUserId();
                        String displayName = (fullName != null && !fullName.isBlank()) ? fullName : userId;
                        userMap.put(userId, new AuditLogUserResponse(userId, displayName, userId));
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to load profiles for audit log users: {}", e.getMessage());
            }
        }

        // 3. เสริมรายชื่อจาก Audit Logs เพิ่มเติม (กรณีมี log เก่าจาก user/system อื่น)
        try {
            List<Object[]> distinctUsers = auditLogRepository.findDistinctUsers();
            if (distinctUsers != null) {
                for (Object[] row : distinctUsers) {
                    String username = row[0] != null ? (String) row[0] : "";
                    String userFullname = row[1] != null ? (String) row[1] : "";
                    String userId = row[2] != null ? (String) row[2] : "";

                    if (!userId.isBlank()) {
                        if (!userMap.containsKey(userId)) {
                            SuProfile profile = profileRepository.findByUserId(userId).orElse(null);
                            String fullName = profile != null ? LocalizationHelper.getFullName(profile) : userFullname;
                            String displayName = (fullName != null && !fullName.isBlank()) ? fullName : (!username.isBlank() ? username : userId);
                            userMap.put(userId, new AuditLogUserResponse(userId, displayName, userId));
                        }
                    } else if (!username.isBlank() && !userMap.containsKey(username)) {
                        String displayName = !userFullname.isBlank() ? userFullname : username;
                        userMap.put(username, new AuditLogUserResponse(username, displayName, username));
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to load distinct users from audit logs: {}", e.getMessage());
        }

        List<AuditLogUserResponse> list = new ArrayList<>(userMap.values());
        list.sort(Comparator.comparing(
                u -> (u.getUserFullname() != null && !u.getUserFullname().isBlank()) ? u.getUserFullname() : u.getUsername(),
                String.CASE_INSENSITIVE_ORDER
        ));
        return list;
    }

    private AuditLogResponse toResponse(SuAuditLog entity) {
        AuditLogResponse response = new AuditLogResponse();
        response.setId(entity.getId());
        response.setUserId(entity.getUserId());
        response.setUsername(entity.getUsername());

        String userFullname = entity.getUserFullname();
        if (entity.getUserId() != null && !entity.getUserId().isBlank()) {
            SuProfile profile = profileRepository.findByUserId(entity.getUserId()).orElse(null);
            if (profile != null) {
                String realName = LocalizationHelper.getFullName(profile);
                if (realName != null && !realName.isBlank()) {
                    userFullname = realName;
                }
            }
        }
        response.setUserFullname((userFullname != null && !userFullname.isBlank()) ? userFullname : entity.getUsername());
        response.setAction(entity.getAction());
        response.setModule(entity.getModule());
        response.setDescription(entity.getDescription());
        response.setTargetType(entity.getTargetType());
        response.setTargetId(entity.getTargetId());
        response.setOldValue(entity.getOldValue());
        response.setNewValue(entity.getNewValue());
        response.setIpAddress(entity.getIpAddress());
        response.setUserAgent(entity.getUserAgent());
        response.setStatus(entity.getStatus());
        response.setDetails(entity.getDetails());
        response.setBusinessId(entity.getBusinessId());
        response.setCreatedDate(entity.getCreatedDate());
        response.setCreatedBy(entity.getCreatedBy());
        return response;
    }
}

