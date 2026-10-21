package com.softinter.sicapi.Interceptor;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * ผูก API กับโปรแกรม (su_program.program_code) เพื่อให้ ProgramPermissionInterceptor ตรวจสิทธิ์ตาม role
 * (add / save / remove / print) ตาม HTTP method; ใส่หลายโปรแกรมได้ = มีสิทธิ์ในโปรแกรมใดโปรแกรมหนึ่งก็ผ่าน.
 * ใส่ที่ method จะใช้แทนของ class.
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireProgram {
    String[] value();
}
