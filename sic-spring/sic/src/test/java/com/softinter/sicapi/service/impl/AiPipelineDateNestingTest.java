package com.softinter.sicapi.service.impl;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** วันที่ที่ AI ส่งมาหลุดช่วงของชั้นแม่ ต้องถูกบีบกลับเข้าช่วง (Phase → Milestone → WP → Task) */
class AiPipelineDateNestingTest {

    private static final LocalDate LO = LocalDate.of(2026, 11, 1);
    private static final LocalDate HI = LocalDate.of(2026, 11, 30);

    @Test
    void clamp_keepsDatesInsideParentRange() {
        assertEquals(LO, AiProjectPipelineJobService.clamp(LocalDate.of(2026, 10, 1), LO, HI));
        assertEquals(HI, AiProjectPipelineJobService.clamp(LocalDate.of(2026, 12, 15), LO, HI));
        LocalDate inside = LocalDate.of(2026, 11, 10);
        assertEquals(inside, AiProjectPipelineJobService.clamp(inside, LO, HI));
    }
}
