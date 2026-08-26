/* cSpell:disable */

# 🚀 Report Service - Project Context & Knowledge Base

ยินดีต้อนรับสู่คลังข้อมูลกลางของโปรเจกต์ โฟลเดอร์ `.project-context/` นี้ถูกจัดทำขึ้นเพื่อเป็น **Single Source of Truth** สำหรับนักพัฒนา (Human Developers) และผู้ช่วยปัญญาประดิษฐ์ (AI Agents) เพื่อให้เข้าใจบริบท มาตรฐาน และสถานะของโปรเจกต์ตรงกัน

---

## 📌 1. Executive Summary (ภาพรวมโปรเจกต์)
* **Project Name:** Report Service
* **Objective:** ระบบสำหรับสร้าง Report 
* **Target Audience:** ทีมพัฒนาเพื่อนำไปเชื่อมต่อกับระบบอื่นผ่าน API และเข้าจัดการผ่านหน้าเว็บของระบบได้

---

## 🗺️ 2. Knowledge Base Directory (สารบัญนำทางสำหรับ AI)
*ส่วนนี้สำคัญมาก เพื่อให้ AI (เช่น Cursor, Copilot) รู้ว่าถ้าต้องการหาคำตอบเรื่องไหน ต้องวิ่งไปอ่านไฟล์ไหน*

### 🏗️ Architecture & Stack
* [tech-stack.md](architecture/tech-stack.md) — รายการเทคโนโลยีที่ใช้, Framework และเวอร์ชันหลัก
* [system-architecture.md](architecture/system-architecture.md) — แผนผังการเชื่อมต่อระบบ โครงสร้าง Infrastructure
* [external-integrations.md](architecture/external-integrations.md) — รายละเอียดและการเชื่อมต่อกับบุคคลที่สาม (Third-party APIs)

### 📐 Rules & Conventions
* [ai-instructions.md](rules-and-conventions/ai-instructions.md) — กฎเหล็กและพฤติกรรมที่คาดหวังจาก AI ในโปรเจกต์นี้
* [code-style.md](rules-and-conventions/code-style.md) — มาตรฐานการจัดฟอร์แมตโค้ด, Naming Convention และ Git Workflow

### 🛡️ Blueprints & Standards
* [ui-ux-standard.md](standards-and-blueprints/ui-ux-standard.md) — มาตรฐานระบบดีไซน์ (Design System), โทนสี, และกฎเหล็กของ Frontend Component
* [api-design.md](standards-and-blueprints/api-design.md) — มาตรฐาน Response Format, HTTP Methods และ Error Payload
* [database-standard.md](standards-and-blueprints/database-standard.md) — โครงสร้างโต๊ะบังคับขั้นต่ำ, Audit Columns และกฎการตั้งชื่อ
* [error-handling.md](standards-and-blueprints/error-handling.md) — วิธีการดักจับข้อผิดพลาด (Exception) และนโยบายการ Logging
* [security-checklist.md](standards-and-blueprints/security-checklist.md) — รายการตรวจสอบความปลอดภัยก่อน Commit และ Deploy

### 📋 Project Management & History
* [todo.md](management/todo.md) — รายการงานที่ค้างอยู่ (Backlog), กำลังทำ (In Progress) และเสร็จสิ้น (Done)
* [changelog.md](management/changelog.md) — บันทึกประวัติการอัปเดตระบบและการเปลี่ยนแปลงสำคัญ

### 🧠 Long-term Memories & Technical Context (ความทรงจำระยะยาว)
*โฟลเดอร์สำหรับเก็บฐานความรู้ ประสบการณ์ และประวัติการตัดสินใจเพื่อป้องกันไม่ให้ AI ทำงานซ้ำซ้อนหรือผิดพลาดเรื่องเดิม*
* [decisions.md](memories/decisions.md) — **Architecture Decision Records (ADR)** บันทึกเหตุผลเชิงเทคนิคว่า "ทำไม" ระบบจึงเลือกออกแบบสถาปัตยกรรมหรือเลือกใช้เครื่องมือ/บริการนั้น ๆ ในอดีต เพื่อไม่ให้ AI เสนอวิธีแก้ปัญหาที่ขัดกับโครงสร้างหลัก
* [ai-learnings.md](memories/ai-learnings.md) — **บันทึกบทเรียนและข้อผิดพลาด** สมุดจดบั๊กหรือเคสแปลก ๆ ที่เคยได้รับการแก้ไขสำเร็จแล้ว เพื่อให้ AI สแกนเป็นบทเรียนและไม่เขียนโค้ดที่ก่อให้เกิดบั๊กเดิมซ้ำซาก
* [context-snapshot.md](memories/context-snapshot.md) — **สรุปสถานะระบบล่าสุดหน้าเดียว** สรุปภาพรวมความพร้อมของระบบในปัจจุบัน หน้างานหลักที่ทีมกำลังรุมโฟกัสในสัปดาห์นี้ และหนี้ทางเทคนิค (Technical Debt) ที่รับรู้ร่วมกัน เพื่อให้ AI ตัวใหม่ที่เพิ่งเปิดใจอ่านโปรเจกต์เข้าใจทิศทางใน 1 นาที

---

## 🤖 3. AI Quick Start (คำสั่งด่วนสำหรับ AI)
*เขียนข้อความนี้ไว้ เพื่อเวลาเราก๊อปปี้ส่งให้ AI ตัวใหม่เปิดใจอ่านโปรเจกต์เราได้ทันที*

> **[Instruction for AI]**
> คุณคือผู้ช่วยพัฒนาในโปรเจกต์นี้ ก่อนเริ่มงานทุกครั้ง กรุณาอ่านสารบัญด้านบนเพื่อทำความเข้าใจบริบทระบบ และตรวจสอบให้แน่ใจว่าโค้ดที่คุณเขียนสอดคล้องกับไฟล์ในหมวด `standards-and-blueprints` และทำความเข้าใจข้อจำกัดในหมวด `memories/` ทุกครั้ง ห้ามคิดค้นมาตรฐานหรือดีไซน์ใหม่ที่ขัดแย้งกับสิ่งที่เราเคยบันทึกไว้ในอดีตเด็ดขาด