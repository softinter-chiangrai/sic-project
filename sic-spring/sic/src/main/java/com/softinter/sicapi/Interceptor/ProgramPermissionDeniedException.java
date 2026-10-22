package com.softinter.sicapi.Interceptor;

/** ไม่มีสิทธิ์ตาม role -> 403 พร้อมข้อความที่ผู้ใช้อ่านเข้าใจ (GlobalExceptionHandler) */
public class ProgramPermissionDeniedException extends RuntimeException {
    public ProgramPermissionDeniedException(String message) {
        super(message);
    }
}
