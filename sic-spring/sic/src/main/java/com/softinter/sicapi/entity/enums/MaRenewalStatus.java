package com.softinter.sicapi.entity.enums;

public enum MaRenewalStatus {
    DRAFT("Draft"),
    PROPOSED("Proposed"),
    CONFIRMED("Confirmed"),
    REJECTED("Rejected"),
    EXPIRED("Expired");

    private final String displayName;

    MaRenewalStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
