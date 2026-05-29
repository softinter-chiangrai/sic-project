package com.softinter.sicapi.service;

import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;

public interface ProgramAccessCache {
    Set<String> getOrCreate(String userId, UUID businessId, Supplier<Set<String>> supplier);
    void remove(String userId, UUID businessId);
    void removeByBusiness(UUID businessId);
    void removeAll();
}
