package com.softinter.sicapi.entity.enums;

public enum BillingType {
    FIXED_PRICE("Fixed Price"),
    MILESTONE("Milestone Billing"),
    MONTHLY("Monthly Billing"),
    MA("MA Billing"),
    CHANGE_REQUEST("Change Request Billing");

    private final String displayName;

    BillingType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
