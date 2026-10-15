package com.softinter.sicapi.exception;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerDataIntegrityTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    private String messageFor(String dbError) {
        var ex = new DataIntegrityViolationException("could not execute statement", new RuntimeException(dbError));
        String body = String.valueOf(handler.handleDataIntegrity(ex).getBody()); // ErrorResponse[success=false, message=..., errors=...]
        return body.substring(body.indexOf("message=") + 8, body.indexOf(", errors="));
    }

    @Test
    void aMissingRequiredValueNamesTheFieldInPlainWords() {
        assertEquals("กรุณาระบุข้อมูลที่จำเป็น: ผู้รับผิดชอบ",
                messageFor("ERROR: null value in column \"assignee_id\" of relation \"pm_change_request\" violates not-null constraint"));
        assertEquals("กรุณาระบุข้อมูลที่จำเป็น: rule name",
                messageFor("ERROR: null value in column \"rule_name\" of relation \"x\" violates not-null constraint"));
    }

    @Test
    void tooLongTextSaysTheLimit() {
        assertEquals("มีข้อความบางช่องยาวเกินกำหนด (ไม่เกิน 50 ตัวอักษร) กรุณาตรวจสอบข้อมูลที่กรอก",
                messageFor("ERROR: value too long for type character varying(50)"));
    }
}
