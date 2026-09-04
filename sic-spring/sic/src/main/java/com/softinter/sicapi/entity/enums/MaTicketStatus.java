package com.softinter.sicapi.entity.enums;

public enum MaTicketStatus {
    OPEN("Open"),
    IN_PROGRESS("In Progress"),
    WAITING_CUSTOMER("Waiting Customer"),
    RESOLVED("Resolved"),
    CLOSED("Closed"),
    CHANGED("Changed");

    private final String displayName;

    MaTicketStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
