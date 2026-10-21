package com.softinter.sicapi.Interceptor;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.function.Predicate;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.response.ProgramPermissionResponse;
import com.softinter.sicapi.repository.su.SuProgramRepository;
import com.softinter.sicapi.service.CurrentUserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * ตรวจสิทธิ์ตาม role ของ API ที่มี @RequireProgram:
 * GET = อ่านได้ (ยกเว้น export/pdf/print/download = print), DELETE = remove, PUT/PATCH = save, POST = add หรือ save.
 * action ในขั้นตอนอนุมัติ / ดูตัวอย่าง / ค้นหา ไม่ตรวจ (ผู้อนุมัติไม่จำเป็นต้องมีสิทธิ์แก้เอกสาร).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ProgramPermissionInterceptor implements HandlerInterceptor {

    private static final Pattern PRINT = Pattern.compile("(export|pdf|print|download)");
    private static final Pattern EXEMPT = Pattern.compile("/(approve|reject|complete|join|change-business|run-lifecycle|[a-z-]*preview|search)(/|$)");

    private final SuProgramRepository programRepository;
    private final CurrentUserService currentUserService;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod hm)) return true;
        RequireProgram rp = hm.getMethodAnnotation(RequireProgram.class);
        if (rp == null) rp = hm.getBeanType().getAnnotation(RequireProgram.class);
        if (rp == null) return true;

        String method = request.getMethod();
        String uri = request.getRequestURI().toLowerCase();
        boolean read = "GET".equals(method) || "HEAD".equals(method) || "OPTIONS".equals(method);

        String action;
        Predicate<ProgramPermissionResponse> allowed;
        if (PRINT.matcher(uri).find()) {
            action = "พิมพ์/ส่งออก";
            allowed = ProgramPermissionResponse::print;
        } else if (read || EXEMPT.matcher(uri).find()) {
            return true;
        } else if ("DELETE".equals(method)) {
            action = "ลบ";
            allowed = ProgramPermissionResponse::remove;
        } else if ("POST".equals(method)) {
            action = "เพิ่ม/บันทึก";
            allowed = p -> p.add() || p.save();
        } else {
            action = "แก้ไข";
            allowed = ProgramPermissionResponse::save;
        }

        UUID businessId = BusinessContextHolder.getBusinessId();
        String userId;
        try {
            userId = currentUserService.getUserId();
        } catch (Exception e) {
            return true; // ยังไม่ login: ให้ security จัดการ
        }
        if (businessId == null) return true; // ยังไม่มี business (เช่นสร้าง business แรก)

        List<String> codes = Arrays.asList(rp.value());
        boolean ok = programRepository.findProgramPermissions(businessId, userId).stream()
                .filter(p -> codes.contains(p.programCode()))
                .anyMatch(allowed);
        if (ok) return true;

        deny(response, userId, method, uri, codes, action);
        return false;
    }

    /** สำหรับ endpoint ที่ใช้ annotation ไม่ได้ (เช่น save ที่ทั้งสร้างใหม่และแก้ไข) */
    public boolean canSave(String programCode) {
        UUID businessId = BusinessContextHolder.getBusinessId();
        if (businessId == null) return true;
        return programRepository.findProgramPermissions(businessId, currentUserService.getUserId()).stream()
                .anyMatch(p -> p.programCode().equals(programCode) && p.save());
    }

    private void deny(HttpServletResponse response, String userId, String method, String uri, List<String> codes, String action) throws java.io.IOException {
        log.warn("Permission denied: user={} {} {} programs={}", userId, method, uri, codes);
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), java.util.Map.of(
                "success", false,
                "message", "คุณไม่มีสิทธิ์" + action + "ในหน้านี้",
                "status", HttpStatus.FORBIDDEN.value()));
    }
}
