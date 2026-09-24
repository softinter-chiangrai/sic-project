package com.softinter.sicapi.entity.enums;

public enum DocumentType {
    REQUIREMENT("Requirement"),
    SPECIFICATION("Specification"),
    DFD("DFD"),
    ER("ER Diagram"),
    DIAGRAM("Diagram"),
    DESIGN_REVIEW("Design Review"),
    DELIVERY("Delivery"),
    INVOICE("Invoice"),
    MA_RENEWAL("MA Renewal"),
    CONTRACT("Contract"),
    CHANGE_REQUEST("Change Request"),
    TEST_PLAN("Test Plan"),
    UAT("UAT"),
    MA_TICKET("MA Ticket"),
    USER_MANUAL("User Manual"),
    TASK("Task"),
    PROJECT("Project");

    private final String displayName;

    DocumentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}