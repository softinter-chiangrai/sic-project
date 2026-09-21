package com.softinter.sicapi.util;

import java.util.Map;

/** ตารางแปลคำไทย/อังกฤษของ Priority ใช้ร่วมกันได้ทุกโมดูลที่มีคอลัมน์ priority = Low/Medium/High/Critical */
public final class PriorityKeywordSearchHelper {

    private PriorityKeywordSearchHelper() {
    }

    public static final Map<String, String> PRIORITY_THAI_MAP = Map.of(
            "ต่ำ", "Low",
            "กลาง", "Medium",
            "ปานกลาง", "Medium",
            "สูง", "High",
            "วิกฤต", "Critical",
            "ด่วน", "Critical"
    );
}
