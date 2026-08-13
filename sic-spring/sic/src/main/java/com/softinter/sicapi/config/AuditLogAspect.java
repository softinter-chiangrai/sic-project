package com.softinter.sicapi.config;

import com.softinter.sicapi.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditLogAspect {

    private final AuditLogService auditLogService;

    @Around("@annotation(auditLogAnnotation)")
    public Object logAudit(ProceedingJoinPoint joinPoint, AuditLog auditLogAnnotation) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        String action = auditLogAnnotation.action().isEmpty() ? method.getName() : auditLogAnnotation.action();
        String module = auditLogAnnotation.module().isEmpty() ? joinPoint.getTarget().getClass().getSimpleName() : auditLogAnnotation.module();
        String description = auditLogAnnotation.description().isEmpty() ? "Execution of " + method.getName() : auditLogAnnotation.description();

        Object result;
        try {
            result = joinPoint.proceed();
            auditLogService.log(action, module, description, "Success", null);
            return result;
        } catch (Throwable throwable) {
            auditLogService.log(action, module, description, "Failed", throwable.getMessage());
            throw throwable;
        }
    }
}
