package com.softinter.sicapi.Interceptor;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Predicate;

import org.springframework.stereotype.Component;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.response.ProgramPermissionResponse;
import com.softinter.sicapi.repository.su.SuProgramRepository;
import com.softinter.sicapi.service.CurrentUserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** ตัวตรวจสิทธิ์ตาม role กลาง: interceptor, body advice และ controller ที่รู้โปรแกรมจาก body ใช้ร่วมกัน */
@Slf4j
@Component
@RequiredArgsConstructor
public class ProgramPermissionService {

    /** ทุกโปรแกรม: ใช้กับ API กลาง (เช่นอัปโหลดไฟล์) = ต้องมีสิทธิ์ action นั้นอย่างน้อยหนึ่งโปรแกรม */
    public static final String ANY = "*";

    public enum Action {
        ADD("เพิ่ม", ProgramPermissionResponse::add),
        SAVE("แก้ไข/บันทึก", ProgramPermissionResponse::save),
        ADD_OR_SAVE("เพิ่ม/บันทึก", p -> p.add() || p.save()),
        REMOVE("ลบ", ProgramPermissionResponse::remove),
        PRINT("พิมพ์/ส่งออก", ProgramPermissionResponse::print);

        final String label;
        final Predicate<ProgramPermissionResponse> test;

        Action(String label, Predicate<ProgramPermissionResponse> test) {
            this.label = label;
            this.test = test;
        }
    }

    /** เอกสารใน export หลายรายการ (BulkDocumentExportService kind) -> โปรแกรม */
    public static final Map<String, String> EXPORT_KIND = Map.ofEntries(
            Map.entry("change-request", "PMDT06"), Map.entry("contract", "PMRT04"), Map.entry("delivery", "PMDT14"),
            Map.entry("design-review", "PMDT09"), Map.entry("invoice", "PMDT16"), Map.entry("ma-ticket", "PMDT17"),
            Map.entry("project", "PMRT02"), Map.entry("requirement", "PMDT04"), Map.entry("specification", "PMDT07"),
            Map.entry("test-scenario", "PMDT12"), Map.entry("user-manual", "PMDT15"));

    /** AI สร้างหลายรายการ (AiModuleRegistry moduleType) -> โปรแกรม */
    public static final Map<String, String> AI_MODULE = Map.ofEntries(
            Map.entry("PROJECT", "PMRT02"), Map.entry("CUSTOMER", "PMRT01"), Map.entry("CONTRACT", "PMRT04"),
            Map.entry("PHASE", "PMDT01"), Map.entry("MILESTONE", "PMDT01"), Map.entry("WORK_PACKAGE", "PMDT01"),
            Map.entry("REQUIREMENT", "PMDT04"), Map.entry("SPECIFICATION", "PMDT07"), Map.entry("CHANGE_REQUEST", "PMDT06"),
            Map.entry("DESIGN_REVIEW", "PMDT09"), Map.entry("TASK", "PMDT10"), Map.entry("TEST_CASE", "PMDT12"),
            Map.entry("TEST_SCENARIO", "PMDT12"), Map.entry("DELIVERY", "PMDT14"), Map.entry("USER_MANUAL", "PMDT15"),
            Map.entry("INVOICE", "PMDT16"), Map.entry("MA_TICKET", "PMDT17"), Map.entry("APPROVAL_FLOW", "BURT06"),
            Map.entry("ROLE", "BURT03"), Map.entry("TEAM", "BURT04"));

    private final SuProgramRepository programRepository;
    private final CurrentUserService currentUserService;

    /** ยังไม่ login / ยังไม่มี business (เช่นสร้าง business แรก) = ไม่ตรวจ */
    private String userOrNull() {
        if (BusinessContextHolder.getBusinessId() == null) return null;
        try {
            return currentUserService.getUserId();
        } catch (Exception e) {
            return null;
        }
    }

    public boolean can(Collection<String> codes, Action action) {
        String userId = userOrNull();
        if (userId == null) return true;
        UUID businessId = BusinessContextHolder.getBusinessId();
        List<ProgramPermissionResponse> perms = programRepository.findProgramPermissions(businessId, userId);
        return perms.stream()
                .filter(p -> codes.contains(ANY) || codes.contains(p.programCode()))
                .anyMatch(action.test);
    }

    /**
     * มี role ของโปรแกรมนี้ (ดูได้อย่างน้อย). ไม่ใช้ cache ของเมนู (programAccess) เพราะไม่ถูกล้างตอนผูก role ให้สมาชิก
     * ponytail: query ต่อ request; ถ้า GET หนักขึ้นค่อยทำ cache ที่ล้างตอนเปลี่ยน role ทุกจุด
     */
    public boolean canRead(Collection<String> codes) {
        String userId = userOrNull();
        if (userId == null || codes.contains(ANY)) return true;
        return programRepository.findProgramPermissions(BusinessContextHolder.getBusinessId(), userId).stream()
                .anyMatch(p -> codes.contains(p.programCode()));
    }

    public void require(Collection<String> codes, Action action) {
        if (!can(codes, action)) deny(codes, action.label);
    }

    public void requireRead(Collection<String> codes) {
        if (!canRead(codes)) deny(codes, "ดูข้อมูล");
    }

    private void deny(Collection<String> codes, String label) {
        log.warn("Permission denied: user={} action={} programs={}", userOrNull(), label, codes);
        throw new ProgramPermissionDeniedException("คุณไม่มีสิทธิ์" + label + "ในหน้านี้");
    }
}
