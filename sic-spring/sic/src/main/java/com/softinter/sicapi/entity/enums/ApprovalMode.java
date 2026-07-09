package com.softinter.sicapi.entity.enums;

public enum ApprovalMode {
    CHAIN("เรียงลำดับ"),
    PARALLEL("พร้อมกัน"),
    ANY("ใครก็ได้"),
    SINGLE("คนเดียว");

    private final String thaiName;

    ApprovalMode(String thaiName) {
        this.thaiName = thaiName;
    }

    public String getThaiName() {
        return thaiName;
    }
}