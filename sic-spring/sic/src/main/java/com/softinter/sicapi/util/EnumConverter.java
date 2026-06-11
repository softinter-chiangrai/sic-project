package com.softinter.sicapi.util;

import com.softinter.sicapi.entity.enums.FileCategory;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class EnumConverter implements AttributeConverter<FileCategory, String> {

    @Override
    public String convertToDatabaseColumn(FileCategory attribute) {
        if (attribute == null) return null;
        // ✅ บันทึกเป็นตัวพิมพ์เล็ก
        return attribute.name().toLowerCase();
    }

    @Override
    public FileCategory convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        // ✅ อ่านค่าไม่ว่าจะเป็นตัวพิมพ์เล็ก/ใหญ่/ผสม ก็แปลงเป็น enum ได้
        return FileCategory.valueOf(dbData.toUpperCase());
    }
}