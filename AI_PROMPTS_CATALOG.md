# สรุปไฟล์ Default & System Prompts สำหรับ AI

| หมวดหมู่ | ชื่อไฟล์ | บรรทัด | รายละเอียด / หน้าที่ของ Prompt |
|---|---|---|---|
| **AI Project Pipeline** | `AiProjectPipelineJobService.java` | 431 | **สร้างโครงการ:** Charter, วัตถุประสงค์, ขอบเขตงาน และจำลองข้อมูลลูกค้าไทย |
| | `AiProjectPipelineJobService.java` | 507 | **ร่างสัญญา:** ขอบเขตงาน, เงื่อนไข และการแบ่งงวดเงิน |
| | `AiProjectPipelineJobService.java` | 565 | **โครงสร้าง WBS:** Phase, Milestone และ Work Package (Gantt Chart) |
| | `AiProjectPipelineJobService.java` | 637 | **Requirement:** สกัด Functional และ Non-functional Requirements |
| | `AiProjectPipelineJobService.java` | 725 | **Diagram:** ร่าง Mermaid Script (DFD, ER, Flowchart, Use Case) |
| | `AiProjectPipelineJobService.java` | 793 | **Specification:** สร้าง System Specifications อิงตาม Requirements |
| | `AiProjectPipelineJobService.java` | 850 | **Design Review:** ข้อเสนอแนะและผลการรีวิวสถาปัตยกรรม |
| | `AiProjectPipelineJobService.java` | 905 | **Task:** แตกงานย่อยและประเมิน Mandays |
| | `AiProjectPipelineJobService.java` | 965 | **Test:** ออกแบบ Test Scenario และ Test Case (SIT / UAT) |
| | `AiProjectPipelineJobService.java` | 1030 | **Delivery:** แผนและรายการเอกสารส่งมอบงาน |
| | `AiProjectPipelineJobService.java` | 1075 | **Manual:** โครงสร้างคู่มือการใช้งานระบบ |
| | `AiProjectPipelineJobService.java` | 1120 | **Invoice:** ร่างใบแจ้งหนี้ตามงวดงาน |
| | `AiProjectPipelineJobService.java` | 1160 | **MA:** Ticket งานบำรุงรักษาและเงื่อนไขการต่อสัญญา MA |
| | `AiProjectPipelineServiceImpl.java` | 46 | **Preview Plan:** สรุปโครงร่างโครงการก่อนกดยืนยันสร้างจริง |
| **สร้างเอกสารรายตัว** | `ProjectGeneratorService.java` | 35 | **โครงการ:** ร่างข้อมูลโครงการและวัตถุประสงค์ |
| | `RequirementGeneratorService.java` | 41, 108 | **Requirement:** วิเคราะห์และร่าง Requirement รายข้อ |
| | `SpecificationGeneratorService.java` | 54 | **Specification:** ร่าง Spec (UI / API / Business Rule) |
| | `TestScenarioGeneratorService.java` | 53 | **Test Scenario:** ออกแบบฉากทัศน์การทดสอบระบบ |
| | `TestCaseGeneratorService.java` | 64 | **Test Case:** ออกแบบขั้นตอนและข้อมูลการทดสอบ (Steps & Test Data) |
| | `ContractGeneratorService.java` | 36 | **สัญญา:** ร่างข้อตกลงและเงื่อนไขสัญญาจ้าง |
| | `DeliveryGeneratorService.java` | 35 | **ส่งมอบ:** ร่างเอกสารส่งมอบและเกณฑ์ตรวจรับงาน |
| | `UserManualGeneratorService.java` | 49 | **คู่มือ:** ร่างหัวข้อและขั้นตอนการใช้งานระบบ |
| | `InvoiceGeneratorService.java` | 44 | **ใบแจ้งหนี้:** ร่างรายการและยอดเงินเบิกจ่ายงวดงาน |
| | `MaTicketGeneratorService.java` | 35 | **MA Ticket:** ร่างรายละเอียดปัญหาและข้อตกลง SLA |
| | `AiSqlGeneratorServiceImpl.java` | 71, 127 | **SQL:** แปลง ER Diagram เป็นสคริปต์ SQL DDL / Migration |
| **แชทและนำทาง** | `AiNavigatorServiceImpl.java` | 78-100 | **Global AI Navigator:** แนะนำขั้นตอนการใช้งานระบบ (Workflow) และนำทางไปหน้าจอที่ถูกต้อง |
| | `PmDiagramChatServiceImpl.java` | 161-170 | **Diagram Chat:** สนทนาและปรับแก้สคริปต์ Mermaid Diagram ผ่านแชท |
| | `PmAiProviderServiceImpl.java` | 439 | **LLM Provider กลาง:** Fallback Prompt สำหรับจัดรูปแบบข้อความ |
| **หน้าบ้าน (Frontend)** | `language.service.ts` | 597-604 | **Suggested Prompts:** ตัวอย่างคำสั่งแนะนำ (วิเคราะห์สถาปัตยกรรม, ออกแบบ ER, Flowchart, Sequence) |
