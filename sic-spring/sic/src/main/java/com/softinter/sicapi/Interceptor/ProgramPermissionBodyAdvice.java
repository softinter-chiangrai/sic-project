package com.softinter.sicapi.Interceptor;

import java.lang.reflect.Type;
import java.util.Arrays;

import org.springframework.core.MethodParameter;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.mvc.method.annotation.RequestBodyAdviceAdapter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.Interceptor.ProgramPermissionService.Action;

import lombok.RequiredArgsConstructor;

/**
 * POST /save ใช้ endpoint เดียวทั้งสร้างและแก้: body มี id = แก้ไข (ต้องมี save), ไม่มี id = สร้างใหม่ (ต้องมี add).
 * interceptor ตรวจ add-หรือ-save ไปแล้วก่อนอ่าน body; ตรงนี้ตรวจให้ตรง action หลังอ่าน body.
 */
@ControllerAdvice
@RequiredArgsConstructor
public class ProgramPermissionBodyAdvice extends RequestBodyAdviceAdapter {

    private final ProgramPermissionService permissions;
    private final ObjectMapper objectMapper;

    @Override
    public boolean supports(MethodParameter parameter, Type targetType, Class<? extends HttpMessageConverter<?>> converterType) {
        return annotationOf(parameter) != null;
    }

    @Override
    public Object afterBodyRead(Object body, HttpInputMessage inputMessage, MethodParameter parameter, Type targetType,
                                Class<? extends HttpMessageConverter<?>> converterType) {
        if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs)) return body;
        var request = attrs.getRequest();
        if (!ProgramPermissionInterceptor.isWritePost(request.getMethod(), request.getRequestURI().toLowerCase())) return body;
        var codes = Arrays.asList(annotationOf(parameter).value());
        if (codes.contains(ProgramPermissionService.ANY)) return body; // API กลาง: interceptor ตรวจ add-หรือ-save แล้ว

        JsonNode node = objectMapper.valueToTree(body);
        if (node == null || !node.isObject()) return body; // list (bulk) -> คงการตรวจ add-หรือ-save ของ interceptor
        // แยกเฉพาะการบันทึกเอกสาร (/save หรือ body มีช่อง id); action อื่น (bulk-save, sign-off, reorder ...) คง add-หรือ-save
        boolean entitySave = request.getRequestURI().toLowerCase().endsWith("/save") || node.has("id");
        if (!entitySave) return body;
        JsonNode id = node.get("id");
        boolean update = id != null && !id.isNull() && !id.asText().isBlank();
        permissions.require(codes, update ? Action.SAVE : Action.ADD);
        return body;
    }

    private static RequireProgram annotationOf(MethodParameter parameter) {
        RequireProgram rp = parameter.getMethodAnnotation(RequireProgram.class);
        return rp != null ? rp : parameter.getContainingClass().getAnnotation(RequireProgram.class);
    }
}
