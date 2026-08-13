package com.softinter.sicapi.entity.enums;

public enum MaTicketType {
    BUG_SUPPORT("Bug Support"),
    DATA_ISSUE("Data Issue"),
    USER_SUPPORT("User Support"),
    CHANGE_REQUEST("Change Request"),
    PERFORMANCE("Performance Issue"),
    SECURITY("Security Issue"),
    INFRA("Server / Infra Issue");

    private final String displayName;

    MaTicketType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
