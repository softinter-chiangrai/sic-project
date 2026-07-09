package com.softinter.sicapi.entity.enums;

public enum DocumentType {
    REQUIREMENT("Requirement"),
    SPECIFICATION("Specification"),
    DFD("DFD"),
    ER("ER Diagram"),
    DELIVERY("Delivery"),
    INVOICE("Invoice"),
    MA_RENEWAL("MA Renewal"),
    CHANGE_REQUEST("Change Request"),
    TEST_PLAN("Test Plan"),
    UAT("UAT");

    private final String displayName;

    DocumentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}