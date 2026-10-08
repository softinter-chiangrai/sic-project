package com.softinter.sicapi.util;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SuppressWarnings({"unchecked", "rawtypes"})
class KeywordSearchHelperTest {

    private final CriteriaBuilder cb = mock(CriteriaBuilder.class);
    private final Path root = mock(Path.class);
    private final Path field = mock(Path.class);
    private final Expression lowered = mock(Expression.class);
    private final Predicate pred = mock(Predicate.class);

    KeywordSearchHelperTest() {
        when(root.get(any(String.class))).thenReturn(field);
        when(cb.lower(any(Expression.class))).thenReturn(lowered);
        when(cb.like(any(Expression.class), any(String.class))).thenReturn(pred);
        when(cb.equal(any(Expression.class), any(Object.class))).thenReturn(pred);
    }

    @Test
    void likeAny_buildsOnePredicatePerField_andResultIsMutable() {
        List<Predicate> preds = KeywordSearchHelper.likeAny(cb, root, "%x%", "a", "b", "c");
        assertEquals(3, preds.size());
        preds.add(pred);
        verify(cb, org.mockito.Mockito.times(3)).like(lowered, "%x%");
    }

    @Test
    void thaiMap_stringValue_comparesLowerCase() {
        List<Predicate> out = new ArrayList<>();
        KeywordSearchHelper.addThaiMapPredicates(cb, root, "priority", KeywordSearchHelper.PRIORITY_THAI_MAP, "ปานกลาง", out);
        assertEquals(2, out.size()); // "กลาง" ⊂ "ปานกลาง" และ "ปานกลาง" ตรงตัว
        verify(cb, org.mockito.Mockito.times(2)).equal(lowered, "medium");
    }

    @Test
    void thaiMap_enumValue_comparesAsIs() {
        enum S { OPEN }
        List<Predicate> out = new ArrayList<>();
        KeywordSearchHelper.addThaiMapPredicates(cb, root, "status", Map.of("เปิด", S.OPEN), "เปิด", out);
        assertEquals(1, out.size());
        verify(cb).equal(field, S.OPEN);
        verify(cb, never()).lower(eq(field));
    }

    @Test
    void thaiMap_noMatch_addsNothing() {
        List<Predicate> out = new ArrayList<>();
        KeywordSearchHelper.addThaiMapPredicates(cb, root, "priority", KeywordSearchHelper.PRIORITY_THAI_MAP, "zzz", out);
        assertTrue(out.isEmpty());
    }
}
