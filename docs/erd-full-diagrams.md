# ER Diagrams (Full / Not Split) - SIC Project

เวอร์ชันทางเลือกของ `docs/erd-diagrams.md` — ให้ผลลัพธ์เดียวกันทุกประการในแง่ความถูกต้อง (อ่านจาก entity จริง, สไตล์ขาวดำ, `direction LR`, ไม่มี PK/FK marker, ไม่มีกล่องลอย) แต่ **ไม่แบ่งย่อยเป็น 16 ไฟล์** เหมือน `docs/erd/` — เก็บไว้ที่ระดับโมดูล (8 ไฟล์) เหมือนตอนแรกที่ยังไม่ตัดแบ่งเพิ่ม

ไฟล์ทั้งหมดอยู่ใน `docs/erd-full/`

| # | ไฟล์ | โมดูล | จำนวน entity | หมายเหตุ |
|---|---|---|---|---|
| 00 | `erd-full/erd-00-overview.mmd` | ภาพรวมทุกโมดูล | - | เหมือนกับ `docs/erd/erd-00-overview.mmd` |
| 01 | `erd-full/erd-01-auth-business.mmd` | Auth / Profile / Business / Access | 12 | รวม 01a+01b เดิมเป็นไฟล์เดียว |
| 02 | `erd-full/erd-02-chat-notification.mmd` | Chat / Messaging | 5 | ไม่เคยถูกแบ่งย่อย ใช้ไฟล์เดิม |
| 03 | `erd-full/erd-03-customer-project-finance.mmd` | Customer / Project / Contract / Delivery / Finance | 12 | รวม 03a+03b เดิมเป็นไฟล์เดียว |
| 04a | `erd-full/erd-04a-requirement-design.mmd` | Requirement / Diagram / Specification / Test / Manual | 9 | รวม 04a1+04a2 เดิม |
| 04b | `erd-full/erd-04b-review-changerequest-trace.mmd` | Change Request / Design Review / Traceability / Comment | 9 + enum ref | รวม 04b1+04b2 เดิม |
| 05 | `erd-full/erd-05-task-approval-bug.mmd` | Phase / Milestone / Work Package / Task / Approval / Bug | 12 | รวม 05a1+05a2+05b1+05b2 เดิม (4 ไฟล์ → 1 ไฟล์) |
| 06 | `erd-full/erd-06-storage.mmd` | File Storage | - | ไม่เคยถูกแบ่งย่อย ใช้ไฟล์เดิม |
| 07 | `erd-full/erd-07-reference-master.mmd` | Reference / Master Data | 7 | ไม่เคยถูกแบ่งย่อย ใช้ไฟล์เดิม |

## จะเลือกใช้เวอร์ชันไหน

- **`docs/erd/`** (16 ไฟล์): เหมาะกับ print ทีละหน้า ตัวอักษรใหญ่ชัดที่สุด แต่ต้องเปิดหลายไฟล์เพื่อดูโมดูลเดียวกันให้ครบ
- **`docs/erd-full/`** (8 ไฟล์): เห็นทั้งโมดูลในภาพเดียว เหมาะกับดูบนจอ/นำเสนอ แต่บางไฟล์ (โดยเฉพาะ 05 ที่มี 12 entity) จะมีภาพสูงกว่าและตัวอักษรเล็กกว่าเวอร์ชันแบ่งย่อยเมื่อ print

ทุกไฟล์ generate จากการอ่าน entity `.java` จริงเหมือนกันทั้งสองเวอร์ชัน ไม่มีข้อมูลใดที่ต่างกัน ต่างกันแค่ระดับการแบ่งไฟล์
