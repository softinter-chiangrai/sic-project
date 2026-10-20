package com.softinter.sicapi.util;

/**
 * Optimistic locking สำหรับ rowVersion (xmin): Hibernate ไม่สนค่า version ที่ตั้งเองบน entity ที่โหลดมาแล้ว
 * (entity.setRowVersion(request...) จึงไม่กันการบันทึกทับ) ต้องเทียบเองก่อนแก้ไข
 */
public final class RowVersionGuard {

    private RowVersionGuard() {
    }

    /** current = rowVersion ของแถวที่โหลดจาก DB (null = แถวใหม่), requested = ที่หน้าจอส่งมา (null = ไม่เช็ค) */
    public static void check(Integer current, Integer requested) {
        if (current != null && requested != null && !requested.equals(current)) {
            throw new RuntimeException("ข้อมูลมีการเปลี่ยนแปลงโดยผู้อื่น กรุณารีเฟรชหน้าเว็บ");
        }
    }
}
