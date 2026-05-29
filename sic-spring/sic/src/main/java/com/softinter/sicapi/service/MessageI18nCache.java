package com.softinter.sicapi.service;

import java.util.Map;

public interface MessageI18nCache {
    Map<String, String> getMessages(String module);
    void evictModule(String module);
    void evictAll();
}
