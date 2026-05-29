package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.repository.su.SuMessageRepository;
import com.softinter.sicapi.service.MessageI18nCache;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@CacheConfig(cacheNames = "i18nMessages")
@RequiredArgsConstructor
public class MessageI18nCacheImpl implements MessageI18nCache {

    private final SuMessageRepository messageRepository;
    private final CacheManager cacheManager;

    @Override
    public Map<String, String> getMessages(String module) {
        String cacheKey = "module:" + module;
        var cache = cacheManager.getCache("i18nMessages");
        if (cache != null) {
            var wrapper = cache.get(cacheKey);
            if (wrapper != null) {
                @SuppressWarnings("unchecked")
                Map<String, String> cached = (Map<String, String>) wrapper.get();
                if (cached != null) {
                    return cached;
                }
            }
        }

        Map<String, String> messages = messageRepository.findByModuleAndIsActiveTrueOrderByMessageKey(module)
                .stream()
                .collect(Collectors.toMap(
                        m -> m.getMessageKey(),
                        m -> m.getMessageLocal() != null ? m.getMessageLocal() : m.getMessageEn()
                ));

        if (cache != null) {
            cache.put(cacheKey, messages);
        }
        return messages;
    }

    @Override
    public void evictModule(String module) {
        var cache = cacheManager.getCache("i18nMessages");
        if (cache != null) {
            cache.evict("module:" + module);
        }
    }

    @Override
    public void evictAll() {
        var cache = cacheManager.getCache("i18nMessages");
        if (cache != null) {
            cache.clear();
        }
    }
}
