package com.softinter.sicapi.util;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class DocumentDiffHelper {

    public static String buildDiffSummary(List<String> changes, String fallbackTitle) {
        if (changes == null || changes.isEmpty()) {
            return fallbackTitle != null && !fallbackTitle.isBlank() ? fallbackTitle + " (อัปเดต)" : "อัปเดตข้อมูลเอกสาร";
        }
        return String.join(", ", changes);
    }

    public static void checkChange(List<String> changes, String fieldName, Object oldVal, Object newVal) {
        if (!Objects.equals(oldVal, newVal)) {
            if (oldVal == null || oldVal.toString().isBlank()) {
                changes.add("เพิ่ม " + fieldName);
            } else if (newVal == null || newVal.toString().isBlank()) {
                changes.add("ลบ " + fieldName);
            } else {
                changes.add("แก้ไข " + fieldName);
            }
        }
    }
}
