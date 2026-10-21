package com.softinter.sicapi.dto.response;

/** สิทธิ์จริงของผู้ใช้ต่อโปรแกรม (รวมทุก role ที่ผู้ใช้มีใน business ปัจจุบัน) */
public record ProgramPermissionResponse(
        String programCode,
        String routePath,
        boolean add,
        boolean save,
        boolean remove,
        boolean print) {
}
