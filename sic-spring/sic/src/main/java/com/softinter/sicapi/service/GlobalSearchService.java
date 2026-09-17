package com.softinter.sicapi.service;

import com.softinter.sicapi.dto.response.GlobalSearchResponse;

import java.util.UUID;

public interface GlobalSearchService {
    GlobalSearchResponse search(UUID businessId, String keyword, int limit);
}
