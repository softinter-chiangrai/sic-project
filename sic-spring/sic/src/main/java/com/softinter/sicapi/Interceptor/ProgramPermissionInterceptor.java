package com.softinter.sicapi.Interceptor;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import com.softinter.sicapi.Interceptor.ProgramPermissionService.Action;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * ตรวจสิทธิ์ตาม role ของ API ที่มี @RequireProgram:
 * GET รายการ = ต้องมี role ของโปรแกรม (GET ตาม id / combobox / lov อ่านข้ามหน้าได้),
 * export/pdf/print/download = print, DELETE = remove, PUT/PATCH = save,
 * POST = add (ไม่มี id) หรือ save (มี id) — แยกละเอียดใน ProgramPermissionBodyAdvice.
 * action ในขั้นตอนอนุมัติ / ดูตัวอย่าง / ค้นหา ไม่ตรวจ (ผู้อนุมัติไม่จำเป็นต้องมีสิทธิ์แก้เอกสาร).
 */
@Component
@RequiredArgsConstructor
public class ProgramPermissionInterceptor implements HandlerInterceptor {

    private static final Pattern PRINT = Pattern.compile("(export|pdf|print|download)");
    private static final Pattern EXEMPT = Pattern.compile("/(approve|reject|complete|join|change-business|run-lifecycle|[a-z-]*preview|search)(/|$)");
    /** อ่านข้ามหน้า: dropdown / lookup / ตาม id (ต้องรู้ id ก่อน) */
    private static final Pattern CROSS_READ = Pattern.compile(
            "/(combobox|lov|lookup|models|options|next-)[a-z-]*(/|$)|/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(/|$)");

    /** action ที่เปลี่ยนสถานะเอกสารเดิม = บันทึก; action ที่สร้างเอกสารใหม่ = เพิ่ม */
    private static final Pattern SAVE_ACTION = Pattern.compile("/(create-revision|sign-off|submit|cancel|implement)(/|$)");
    private static final Pattern ADD_ACTION = Pattern.compile("/(create-invoice)(/|$)");

    private final ProgramPermissionService permissions;

    static RequireProgram annotationOf(HandlerMethod hm) {
        RequireProgram rp = hm.getMethodAnnotation(RequireProgram.class);
        return rp != null ? rp : hm.getBeanType().getAnnotation(RequireProgram.class);
    }

    /** POST ที่ต้องแยก add/save จาก body (ไม่ใช่ print / ขั้นตอนอนุมัติ / action ที่กำหนดสิทธิ์ไว้แล้ว) */
    static boolean isWritePost(String method, String uri) {
        return "POST".equals(method) && !PRINT.matcher(uri).find() && !EXEMPT.matcher(uri).find()
                && !SAVE_ACTION.matcher(uri).find() && !ADD_ACTION.matcher(uri).find();
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod hm)) return true;
        RequireProgram rp = annotationOf(hm);
        if (rp == null) return true;

        List<String> codes = Arrays.asList(rp.value());
        String method = request.getMethod();
        String uri = request.getRequestURI().toLowerCase();
        boolean read = "GET".equals(method) || "HEAD".equals(method) || "OPTIONS".equals(method);

        if (PRINT.matcher(uri).find()) {
            permissions.require(codes, Action.PRINT);
        } else if (read) {
            if (!CROSS_READ.matcher(uri).find()) permissions.requireRead(codes);
        } else if (EXEMPT.matcher(uri).find()) {
            return true;
        } else if (codes.contains(ProgramPermissionService.ANY)) {
            // API กลาง (อัปโหลด/ลบไฟล์แนบ) ใช้ระหว่างแก้เอกสาร: แค่มีสิทธิ์เพิ่มหรือบันทึกที่ใดที่หนึ่ง (ผู้ใช้ดูอย่างเดียวทำไม่ได้)
            permissions.require(codes, Action.ADD_OR_SAVE);
        } else if (SAVE_ACTION.matcher(uri).find()) {
            permissions.require(codes, Action.SAVE);
        } else if (ADD_ACTION.matcher(uri).find()) {
            permissions.require(codes, Action.ADD);
        } else if ("DELETE".equals(method)) {
            permissions.require(codes, Action.REMOVE);
        } else if ("POST".equals(method)) {
            permissions.require(codes, Action.ADD_OR_SAVE); // body advice แยก add/save ต่อเมื่ออ่าน body แล้ว
        } else {
            permissions.require(codes, Action.SAVE);
        }
        return true;
    }
}
