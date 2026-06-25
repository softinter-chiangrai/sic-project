package com.softinter.sicapi.util;

import com.softinter.sicapi.entity.base.BaseEntity;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;

public final class UniquenessValidator {
    private UniquenessValidator() {}

    public static <T extends BaseEntity> void validate(
            String newValue,
            String oldValue,
            Function<String, Optional<T>> fetcher,
            UUID currentId,
            String fieldName) {
        if (newValue == null || newValue.isBlank()) return;
        if (oldValue != null && oldValue.equals(newValue)) return;

        fetcher.apply(newValue).ifPresent(existing -> {
            UUID existingId = existing.getId();
            if (currentId == null || !currentId.equals(existingId)) {
                throw new IllegalArgumentException(fieldName + " is already registered.");
            }
        });
    }
}