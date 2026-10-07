package com.softinter.sicapi.util;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * สถานะวงจรชีวิตของสัญญา คำนวณจากวันที่และสถานะ (ไม่เก็บใน DB เพื่อไม่ต้องมีใครมาตั้งค่า "หมดอายุ" เอง
 * และไม่ไปปลดล็อกสัญญาที่ลงนามแล้ว ซึ่งผูกกับ signStatus = Signed)
 */
public final class ContractLifecycle {

    public static final String DRAFT = "DRAFT";
    public static final String ACTIVE = "ACTIVE";
    public static final String EXPIRING = "EXPIRING";
    public static final String EXPIRED = "EXPIRED";
    public static final String RENEWED = "RENEWED";
    public static final String CANCELLED = "CANCELLED";

    public static final String RENEWAL_STATUS_RENEWED = "ต่อแล้ว";
    public static final String RENEWAL_STATUS_CANCELLED = "ยกเลิก";
    /** ใกล้หมดอายุ = เหลือไม่เกินกี่วัน */
    public static final int EXPIRING_DAYS = 60;

    private ContractLifecycle() {
    }

    public static Integer daysUntilExpiry(LocalDate endDate, LocalDate today) {
        return endDate == null ? null : (int) ChronoUnit.DAYS.between(today, endDate);
    }

    public static String status(String signStatus, String renewalStatus, LocalDate endDate, LocalDate today) {
        if (RENEWAL_STATUS_CANCELLED.equals(renewalStatus)) return CANCELLED;
        if (RENEWAL_STATUS_RENEWED.equals(renewalStatus)) return RENEWED;
        if (signStatus != null && signStatus.equalsIgnoreCase("Expired")) return EXPIRED;
        if (signStatus == null || !signStatus.equalsIgnoreCase("Signed")) return DRAFT;
        Integer days = daysUntilExpiry(endDate, today);
        if (days == null) return ACTIVE;
        if (days < 0) return EXPIRED;
        return days <= EXPIRING_DAYS ? EXPIRING : ACTIVE;
    }
}
