package com.softinter.sicapi.entity.enums;

public enum ApprovalStatus {
    PENDING("รอดำเนินการ"),
    PARTIALLY_APPROVED("อนุมัติบางส่วน"),
    APPROVED("อนุมัติแล้ว"),
    REJECTED("ปฏิเสธ"),
    NEED_REVISION("ต้องแก้ไข"),
    CANCELLED("ยกเลิก"),
    EXPIRED("หมดอายุ"), 
    SKIPPED("ข้าม");

    private final String thaiName;

    ApprovalStatus(String thaiName) {
        this.thaiName = thaiName;
    }

    public String getThaiName() {
        return thaiName;
    }

    public boolean isFinal() {
        return this == APPROVED || this == REJECTED || this == CANCELLED || this == EXPIRED;
    }

    public boolean isPending() {
        return this == PENDING || this == PARTIALLY_APPROVED || this == NEED_REVISION;
    }
}