package com.softinter.sicapi.util;

import java.time.LocalDate;

/** The end of a document's period must not be earlier than its start (same day / same time is fine). */
public final class DateRangeValidator {

    public static final String MESSAGE = "วันที่/เวลาสิ้นสุดต้องไม่น้อยกว่าวันที่/เวลาเริ่มต้น";

    private DateRangeValidator() {
    }

    public static void check(LocalDate start, LocalDate end) {
        check(start, null, end, null);
    }

    /** times are "HH:mm" (or "HH:mm:ss"); compared only when both days are the same */
    public static void check(LocalDate start, String startTime, LocalDate end, String endTime) {
        if (start == null || end == null) return;
        boolean endTimeEarlier = start.equals(end) && startTime != null && endTime != null
                && !startTime.isBlank() && !endTime.isBlank()
                && hhmm(endTime).compareTo(hhmm(startTime)) < 0;
        if (end.isBefore(start) || endTimeEarlier) {
            throw new IllegalArgumentException(MESSAGE);
        }
    }

    private static String hhmm(String time) {
        String t = time.trim();
        return t.length() >= 5 ? t.substring(0, 5) : (t.length() == 4 ? "0" + t : t);
    }
}
