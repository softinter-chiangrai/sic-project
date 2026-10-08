package com.softinter.sicapi.util;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** ตัวช่วยสร้าง predicate ของช่อง Search (LIKE หลายคอลัมน์ + แปลคำไทย/อังกฤษ) ใช้ร่วมกันทุกโมดูล */
public final class KeywordSearchHelper {

    /** ตารางแปลคำไทย/อังกฤษของ Priority ใช้ร่วมกันได้ทุกโมดูลที่มีคอลัมน์ priority = Low/Medium/High/Critical */
    public static final Map<String, String> PRIORITY_THAI_MAP = Map.of(
            "ต่ำ", "Low",
            "กลาง", "Medium",
            "ปานกลาง", "Medium",
            "สูง", "High",
            "วิกฤต", "Critical",
            "ด่วน", "Critical"
    );

    private KeywordSearchHelper() {
    }

    /** lower(field) LIKE pattern สำหรับทุก field (ผลลัพธ์เป็น list ที่เพิ่มต่อได้) */
    public static List<Predicate> likeAny(CriteriaBuilder cb, Path<?> root, String pattern, String... fields) {
        List<Predicate> preds = new ArrayList<>(fields.length);
        for (String field : fields) {
            preds.add(cb.like(cb.lower(root.get(field)), pattern));
        }
        return preds;
    }

    /**
     * ถ้า rawKw ตรงกับคำไทยใน map (ทั้งสองทิศทาง contains) ให้เพิ่มเงื่อนไข field = ค่าที่แปลแล้ว
     * ค่าแบบ String เทียบแบบ lower-case, ค่าแบบอื่น (enum) เทียบตรงๆ
     */
    public static void addThaiMapPredicates(CriteriaBuilder cb, Path<?> root, String field,
                                            Map<String, ?> thaiMap, String rawKw, List<Predicate> orPreds) {
        for (var entry : thaiMap.entrySet()) {
            if (rawKw.contains(entry.getKey()) || entry.getKey().contains(rawKw)) {
                Object value = entry.getValue();
                orPreds.add(value instanceof String s
                        ? cb.equal(cb.lower(root.get(field)), s.toLowerCase())
                        : cb.equal(root.get(field), value));
            }
        }
    }
}
