package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.service.ProgramAccessCache;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;

@Service
@CacheConfig(cacheNames = "programAccess")
public class ProgramAccessCacheImpl implements ProgramAccessCache {

    private final CacheManager cacheManager;

    public ProgramAccessCacheImpl(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    @Override
    public Set<String> getOrCreate(String userId, UUID businessId, Supplier<Set<String>> supplier) {
        String key = userId + ":" + businessId;
        Cache cache = cacheManager.getCache("programAccess");
        if (cache != null) {
            Cache.ValueWrapper wrapper = cache.get(key);
            if (wrapper != null) {
                @SuppressWarnings("unchecked")
                Set<String> value = (Set<String>) wrapper.get();
                if (value != null) {
                    return value;
                }
            }
        }
        Set<String> value = supplier.get();
        if (cache != null) {
            cache.put(key, value);
        }
        return value;
    }

    @Override
    public void remove(String userId, UUID businessId) {
        String key = userId + ":" + businessId;
        Cache cache = cacheManager.getCache("programAccess");
        if (cache != null) {
            cache.evict(key);
        }
    }

    @Override
    public void removeByBusiness(UUID businessId) {
        // Evict all entries - in production use a more targeted approach
        Cache cache = cacheManager.getCache("programAccess");
        if (cache != null) {
            cache.clear();
        }
    }

    @Override
    public void removeAll() {
        Cache cache = cacheManager.getCache("programAccess");
        if (cache != null) {
            cache.clear();
        }
    }
}
