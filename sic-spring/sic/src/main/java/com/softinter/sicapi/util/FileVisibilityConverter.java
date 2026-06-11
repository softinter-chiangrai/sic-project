package com.softinter.sicapi.util;

import com.softinter.sicapi.entity.enums.FileVisibility;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class FileVisibilityConverter implements AttributeConverter<FileVisibility, Integer> {

    @Override
    public Integer convertToDatabaseColumn(FileVisibility attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public FileVisibility convertToEntityAttribute(Integer dbData) {
        if (dbData == null) return null;
        return fromCode(dbData);
    }

    // Helper methods สำหรับ business logic และ JSON deserializer
    public static FileVisibility fromCode(int code) {
        for (FileVisibility v : FileVisibility.values()) {
            if (v.getCode() == code) return v;
        }
        return FileVisibility.PUBLIC; // fallback
    }

    public static FileVisibility fromString(String value) {
        if (value == null) return FileVisibility.PUBLIC;
        try {
            // ถ้าเป็นชื่อ enum (UPLOADER_ONLY, BUSINESS_ONLY, ...)
            return FileVisibility.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            try {
                // ถ้าเป็นตัวเลข (1,2,3,4)
                int code = Integer.parseInt(value);
                return fromCode(code);
            } catch (NumberFormatException ex) {
                return FileVisibility.PUBLIC;
            }
        }
    }
}