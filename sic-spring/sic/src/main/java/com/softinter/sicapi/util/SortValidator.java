package com.softinter.sicapi.util;

import java.lang.reflect.Field;
import java.util.HashSet;
import java.util.Set;

import org.springframework.data.domain.Sort;

/**
 * Whitelists sort fields against an entity's declared fields (including superclass fields)
 * so a bogus `sortBy` query param produces a safe fallback instead of a
 * PropertyReferenceException/QuerySyntaxException at query time.
 */
public class SortValidator {

    private SortValidator() {}

    public static Sort build(Class<?> entityClass, String sortBy, String sortDirection, String fallbackField) {
        Set<String> allowed = new HashSet<>();
        Class<?> current = entityClass;
        while (current != null && current != Object.class) {
            for (Field f : current.getDeclaredFields()) {
                allowed.add(f.getName());
            }
            current = current.getSuperclass();
        }

        String field = (sortBy != null && allowed.contains(sortBy)) ? sortBy : fallbackField;
        Sort.Direction direction = "DESC".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return Sort.by(direction, field);
    }
}
