package com.softinter.sicapi.entity.enums;

public enum PaymentStatus {
    UNPAID("Unpaid"),
    PARTIAL("Partial"),
    PAID("Paid"),
    OVERDUE("Overdue"),
    CANCELLED("Cancelled");

    private final String displayName;

    PaymentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
