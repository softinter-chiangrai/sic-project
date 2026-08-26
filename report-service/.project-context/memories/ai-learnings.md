/* cSpell:disable */

# AI Learnings — บั๊กที่เจอจริงและวิธีแก้

> เริ่มบันทึกครั้งแรก 2026-07-07 พร้อมกับงานเพิ่มเมนู Generate/Queue/Bulk Generate — ก่อนหน้านี้ไฟล์นี้ว่างเปล่า

## บั๊ก: `UnexpectedRollbackException` เมื่อ catch exception จาก nested `@Transactional` method แล้วพยายาม continue (2026-07-07)

**อาการที่เจอจริงตอน smoke test**: ยิง queue generate request ผ่าน `/api/report-queue` แล้ว item ค้างสถานะ `Queued` ตลอดไป ไม่ขยับเป็น `Processing`/`Failed` เลย ทั้งที่ `@Scheduled processQueue()` รันอยู่ทุก 5 วินาทีจริง (เห็น log Hibernate query ทำงานต่อเนื่อง) เปิด log ดูเจอ:
```
org.springframework.transaction.UnexpectedRollbackException: Transaction silently rolled back because it has been marked as rollback-only
    at ...TransactionInterceptor.invoke(...)
    at ...ReportGenerationQueueService$$SpringCGLIB$$0.processQueue(<generated>)
```

**สาเหตุ**: `ReportGenerationQueueService.processQueue()` เป็น `@Transactional` (REQUIRED, default) วนเรียก `processQueueItem(item)` ซึ่งเรียก `generatedReportService.generateFromQueue(...)` — ตอนนั้น `generateFromQueue` เองก็เป็น `@Transactional` (REQUIRED เช่นกัน) จึง **join transaction เดียวกับ `processQueue()`** ไม่ได้แยกกัน เมื่อ template ที่ generate ล้มเหลว (เช่น ไม่มี data source) `generateFromQueue` จะ throw `IllegalArgumentException` ออกมา แม้โค้ดใน `processQueueItem` จะมี `try { ... } catch (RuntimeException e) { item.setStatus("Failed"); ... }` ดักไว้แล้วก็ตาม — Spring's transaction interceptor ที่ครอบ `generateFromQueue` เห็น exception หลุดออกจาก method ของมันเอง **จะ mark transaction (ที่ใช้ร่วมกับ `processQueue()`) เป็น rollback-only ทันที** ไม่สนใจว่า caller จะ catch ไว้หรือไม่ เมื่อ `processQueue()` ทำงานจบแล้ว (return ปกติ เพราะ exception ถูก catch ไปแล้ว) Spring transaction manager พยายาม **commit** แต่เจอ flag rollback-only ที่ค้างอยู่ → โยน `UnexpectedRollbackException` ทันที ทำให้ทั้ง `repository.save(item)` ที่ตั้งใจจะบันทึกสถานะ `Failed` ก็ถูก rollback ไปด้วย (item เลยยังค้างเป็น `Queued` ต่อไปเรื่อย ๆ)

**บั๊กเดียวกันเจอซ้ำที่จุดที่สอง**: `BulkReportGenerationService.performBulkGeneration(...)` (`@Transactional`) วนเรียก `generatedReportService.generateBytesForBulk(...)` (`@Transactional(readOnly = true)`, REQUIRED) ในลูปต่อ item แล้ว catch exception เพื่อประมวลผล item ถัดไปต่อ — ปัญหาเดียวกันเป๊ะ (แม้จะเป็น `readOnly = true` ก็ยังโดน mark rollback-only เหมือนกัน เพราะ Spring ไม่สนใจว่า method จะเขียนข้อมูลจริงหรือไม่ สนใจแค่ว่ามี `@Transactional` ครอบแล้ว exception หลุดออกจาก method นั้น)

**วิธีแก้**: เปลี่ยน propagation ของทั้ง `generateFromQueue` และ `generateBytesForBulk` เป็น `@Transactional(propagation = Propagation.REQUIRES_NEW)` — บังคับให้แต่ละครั้งที่เรียกเปิด transaction ใหม่แยกจาก caller เสมอ พอมันล้มเหลว transaction ของมันเองจะ rollback ตามปกติ (isolated ไม่กระทบ transaction ของ caller) แล้ว caller (`processQueueItem`/`performBulkGeneration`) ที่ catch exception ไว้ จะ**ยังอยู่ใน transaction เดิมที่สะอาด**ต่อไป สามารถ `repository.save(item)` เพื่อบันทึกสถานะ `Failed` ได้จริงตอน commit

**จุดสังเกตสำคัญ**: โค้ดเดิมในโปรเจกต์นี้เคยเจอปัญหาแบบเดียวกันมาก่อนแล้วและแก้ถูกวิธีไว้แล้วที่ `AuditLogService.logReportGenerationFailed(...)` และเมธอดใกล้เคียง — ทุกตัวมี `@Transactional(propagation = Propagation.REQUIRES_NEW)` กำกับไว้ (เพื่อให้ audit log การล้มเหลวถูกบันทึกได้แม้ transaction หลักของการ generate จะ rollback) น่าจะเป็นเหตุผลเดียวกันที่ทีมเดิมเคยเจอและแก้ไว้แล้ว — **ถ้าจะเพิ่มโค้ดใหม่ที่ loop เรียก `@Transactional` method หลายครั้งแล้ว catch-and-continue ต่อ item ควรเช็ค propagation ของเมธอดที่ถูกเรียกก่อนเสมอ**

**วิธีสังเกต/ทดสอบว่าเจอปัญหานี้**: อาการเด่นคือ operation ที่ "ควรจะบันทึกสถานะ error ได้" กลับไม่ถูกบันทึกเลย (ไม่มี error, ไม่มี log อะไรผิดปกติในเชิง business logic) ต้องเปิด log ระดับ Spring transaction/scheduler ถึงจะเห็น `UnexpectedRollbackException` ที่มาจาก scheduled task's error handler (`TaskUtils$LoggingErrorHandler`) ซึ่งไม่ทำให้แอปพัง แค่ silent-fail ทุกรอบของ scheduled job นั้น — สังเกตยากถ้าไม่ได้รันแอปจริงแล้วดู log (unit/integration test ที่ mock service มักไม่จับปัญหานี้ได้ เพราะ transaction proxy ทำงานจริงเฉพาะตอนรันผ่าน Spring context ที่มี transaction manager จริง)

