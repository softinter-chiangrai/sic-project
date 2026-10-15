package com.softinter.sicapi.util;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class DateRangeValidatorTest {

    private static final LocalDate D16 = LocalDate.of(2026, 10, 16);

    @Test
    void endDayBeforeStartDayIsRejectedWithAPlainMessage() {
        var e = assertThrows(IllegalArgumentException.class, () -> DateRangeValidator.check(D16, D16.minusDays(1)));
        assertEquals(DateRangeValidator.MESSAGE, e.getMessage());
    }

    @Test
    void sameDayComparesTheTimes() {
        assertThrows(IllegalArgumentException.class, () -> DateRangeValidator.check(D16, "13:00", D16, "09:30"));
        assertDoesNotThrow(() -> DateRangeValidator.check(D16, "13:00", D16, "13:00:00"));
        assertDoesNotThrow(() -> DateRangeValidator.check(D16, "13:00", D16.plusDays(1), "09:00"));
    }

    @Test
    void missingValuesAreLeftToTheRequiredChecks() {
        assertDoesNotThrow(() -> DateRangeValidator.check(null, D16));
        assertDoesNotThrow(() -> DateRangeValidator.check(D16, null));
        assertDoesNotThrow(() -> DateRangeValidator.check(D16, null, D16, "09:00"));
    }
}
