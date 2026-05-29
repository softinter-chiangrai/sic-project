package com.softinter.sicapi.config;

import java.util.UUID;

public class BusinessContextHolder {

    private static final ThreadLocal<UUID> BUSINESS_ID = new ThreadLocal<>();

    public static void setBusinessId(UUID businessId) {
        BUSINESS_ID.set(businessId);
    }

    public static UUID getBusinessId() {
        return BUSINESS_ID.get();
    }

    public static void clear() {
        BUSINESS_ID.remove();
    }
}
