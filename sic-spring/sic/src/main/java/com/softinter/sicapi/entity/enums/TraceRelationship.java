package com.softinter.sicapi.entity.enums;

public enum TraceRelationship {
    DESIGNED_BY,      // DFD ถูกออกแบบจาก Requirement
    IMPLEMENTED_BY,   // ER/SPEC/Task ถูกนำไปใช้งาน
    DOCUMENTED_BY,    // Spec บันทึก Requirement หรือ ER
    VERIFIED_BY,      // Test Case ตรวจสอบ Task
    FAILED_BY,        // Bug เกิดจาก Test Case ที่ล้มเหลว
    AFFECTED_BY,      // ถูกกระทบ (ใช้ใน Impact Analysis)
    RELATED_TO        // ทั่วไป
}