-- แก้ document_type ที่ไม่ตรงกันใน pm_document_version ซึ่งเกิดจากโค้ด auto-create-version-on-approval
-- เดิม ที่บันทึกโดยใช้ document type ของระบบอนุมัติ (approval flow) ตรง ๆ แทนที่จะแปลงให้ตรงกับชื่อย่อ
-- ที่แต่ละโมดูลใช้บันทึกประวัติเวอร์ชันของตัวเองตามปกติ ทำให้ประวัติที่สร้างตอนอนุมัติแยกกลุ่มออกไป
-- และไม่ถูกกรองเจอในหน้าจอ Document Version History

UPDATE pm_document_version SET document_type = 'SPEC' WHERE document_type = 'SPECIFICATION';
UPDATE pm_document_version SET document_type = 'MANUAL' WHERE document_type = 'USER_MANUAL';

UPDATE pm_document_version v
SET document_type = d.diagram_type
FROM pm_diagram d
WHERE v.document_type = 'DIAGRAM' AND v.document_id = d.id;
