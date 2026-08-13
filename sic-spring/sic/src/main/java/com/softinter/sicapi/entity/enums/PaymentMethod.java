package com.softinter.sicapi.entity.enums;

public enum PaymentMethod {
    BANK_TRANSFER("Bank Transfer"),
    CASH("Cash"),
    CHEQUE("Cheque"),
    CREDIT_CARD("Credit Card"),
    OTHER("Other");

    private final String displayName;

    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
