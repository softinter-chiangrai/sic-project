package com.softinter.sicapi.service;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

import lombok.Builder;
import lombok.Getter;

/**
 * Single source of truth for which business modules the Global AI Navigator and the AI Batch
 * Generator know about: the human label, where the module's list page lives, where the
 * "create new" route is (used to auto-open that page's AI modal after navigation), and the
 * JSON schema the batch generator must ask the LLM to produce for that module.
 *
 * Add a new module here to make it available to BOTH features at once.
 */
@Component
public class AiModuleRegistry {

    @Getter
    @Builder
    public static class ModuleDef {
        private String moduleType;
        private String label;
        private String listRoute;
        private String createRoute;
        private String schemaDescription;
    }

    private final Map<String, ModuleDef> modules = new LinkedHashMap<>();

    public AiModuleRegistry() {
        register(ModuleDef.builder()
                .moduleType("PROJECT")
                .label("โครงการ (Project)")
                .listRoute("/feature/pm/project")
                .createRoute("/feature/pm/project/new")
                .schemaDescription("{ \"projectName\": string, \"description\": string (HTML), \"status\": string|null }")
                .build());

        register(ModuleDef.builder()
                .moduleType("CUSTOMER")
                .label("ลูกค้า (Customer)")
                .listRoute("/feature/pm/customer")
                .createRoute("/feature/pm/customer/new")
                .schemaDescription("{ \"companyNameLocal\": \"ชื่อบริษัทไทย (เช่น บริษัท สยามนวัตกรรม ดิจิทัล จำกัด)\", \"companyNameEn\": \"Company name in English (e.g. Siam Innovation Digital Co., Ltd.)\", \"taxId\": \"เลขประจำตัวผู้เสียภาษี 13 หลัก ขึ้นต้น 01055xxxxxxxx\", \"branchCode\": \"00000\", \"contactPerson\": \"ชื่อผู้ติดต่อคนไทย เช่น คุณสมชาย วิจิตรศิลป์\", \"phoneNumber\": \"เบอร์โทรศัพท์ไทย เช่น 02-xxx-xxxx หรือ 08x-xxx-xxxx\", \"email\": \"อีเมล เช่น contact@domain.co.th\", \"addressLocal\": \"ที่อยู่ในประเทศไทย เช่น 88/12 อาคารสยามทาวเวอร์ ชั้น 18 ถนนสุขุมวิท 21 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพมหานคร 10110\", \"addressEn\": \"Thai address in English\", \"zipCode\": \"10110\" }")
                .build());

        register(ModuleDef.builder()
                .moduleType("CONTRACT")
                .label("สัญญา (Contract)")
                .listRoute("/feature/pm/contract")
                .createRoute("/feature/pm/contract/new")
                .schemaDescription("{ \"contractName\": string, \"contractNo\": string|null, \"description\": string, \"contractValue\": number|null, \"startDate\": null, \"endDate\": null }")
                .build());

        register(ModuleDef.builder()
                .moduleType("PHASE")
                .label("ระยะโครงการ (Phase)")
                .listRoute("/feature/pm/phase")
                .createRoute("/feature/pm/phase/new")
                .schemaDescription("{ \"phaseName\": string, \"description\": string, \"startDate\": \"YYYY-MM-DD\"|null, \"endDate\": \"YYYY-MM-DD\"|null, \"color\": \"#3B82F6\"|\"#10B981\"|\"#8B5CF6\"|\"#F59E0B\"|\"#EC4899\"|\"#06B6D4\" }")
                .build());

        register(ModuleDef.builder()
                .moduleType("REQUIREMENT")
                .label("ความต้องการ (Requirement)")
                .listRoute("/feature/pm/requirement")
                .createRoute("/feature/pm/requirement/new")
                .schemaDescription("{ \"title\": string, \"description\": string, \"requirementType\": \"FUNCTIONAL\"|\"NON_FUNCTIONAL\"|\"BUSINESS_RULE\", \"priority\": \"High\"|\"Medium\"|\"Low\", \"source\": string|null }")
                .build());

        register(ModuleDef.builder()
                .moduleType("TEST_CASE")
                .label("Test Case")
                .listRoute("/feature/pm/test-management")
                .createRoute("/feature/pm/test-management")
                .schemaDescription("{ \"title\": string, \"testStep\": string, \"expectedResult\": string, \"priority\": \"High\"|\"Medium\"|\"Low\", \"testType\": \"SIT\"|\"UAT\" }")
                .build());

        register(ModuleDef.builder()
                .moduleType("TEST_SCENARIO")
                .label("Test Scenario")
                .listRoute("/feature/pm/test-management")
                .createRoute("/feature/pm/test-scenario/new")
                .schemaDescription("{ \"scenarioName\": string, \"description\": string }")
                .build());

        register(ModuleDef.builder()
                .moduleType("SPECIFICATION")
                .label("Specification")
                .listRoute("/feature/pm/specification")
                .createRoute("/feature/pm/specification/new")
                .schemaDescription("{ \"title\": string, \"description\": string, \"specificationType\": \"UI Specification\"|\"API Specification\"|\"Business Rule Specification\", \"priority\": \"High\"|\"Medium\"|\"Low\", \"module\": string|null }")
                .build());

        register(ModuleDef.builder()
                .moduleType("USER_MANUAL")
                .label("คู่มือผู้ใช้งาน (User Manual)")
                .listRoute("/feature/pm/manual")
                .createRoute("/feature/pm/manual/new")
                .schemaDescription("{ \"manualTitle\": string, \"manualType\": \"USER\"|\"ADMIN\"|\"API\", \"version\": \"1.0.0\" }")
                .build());

        register(ModuleDef.builder()
                .moduleType("DELIVERY")
                .label("การส่งมอบ (Delivery)")
                .listRoute("/feature/pm/delivery")
                .createRoute("/feature/pm/delivery/new")
                .schemaDescription("{ \"deliveryTitle\": string, \"deliverySummary\": string, \"deliveryType\": \"FINAL\"|\"SPRINT\"|\"INTERIM\" }")
                .build());

        register(ModuleDef.builder()
                .moduleType("MA_TICKET")
                .label("MA Ticket")
                .listRoute("/feature/pm/ma-ticket")
                .createRoute("/feature/pm/ma-ticket/new")
                .schemaDescription("{ \"title\": string, \"description\": string, \"severity\": \"CRITICAL\"|\"HIGH\"|\"MEDIUM\"|\"LOW\", \"ticketType\": \"BUG_SUPPORT\"|\"CR_SUPPORT\"|\"GENERAL_QUESTION\" }")
                .build());

        register(ModuleDef.builder()
                .moduleType("INVOICE")
                .label("ใบแจ้งหนี้ (Invoice)")
                .listRoute("/feature/pm/invoice")
                .createRoute("/feature/pm/invoice/new")
                .schemaDescription("{ \"invoiceNo\": null, \"description\": string, \"amount\": number|null }")
                .build());

        register(ModuleDef.builder()
                .moduleType("APPROVAL_FLOW")
                .label("Approval Flow")
                .listRoute("/feature/bu/approval-flow")
                .createRoute("/feature/bu/approval-flow/new")
                .schemaDescription("{ \"stepName\": string, \"approverRole\": string, \"stepOrder\": number }")
                .build());

        register(ModuleDef.builder()
                .moduleType("ROLE")
                .label("บทบาท (Role)")
                .listRoute("/feature/bu/role")
                .createRoute("/feature/bu/role")
                .schemaDescription("{ \"roleName\": string, \"description\": string }")
                .build());

        register(ModuleDef.builder()
                .moduleType("TEAM")
                .label("ทีม (Team)")
                .listRoute("/feature/bu/team")
                .createRoute("/feature/bu/team")
                .schemaDescription("{ \"teamName\": string, \"description\": string }")
                .build());

        register(ModuleDef.builder()
                .moduleType("TASK")
                .label("งาน (Task)")
                .listRoute("/feature/pm/task-board")
                .createRoute("/feature/pm/task/new")
                .schemaDescription("{ \"taskName\": string, \"description\": string, \"priority\": \"Critical\"|\"High\"|\"Medium\"|\"Low\", \"estimateManday\": number, \"color\": \"#3B82F6\"|\"#10B981\"|\"#8B5CF6\"|\"#F59E0B\" }")
                .build());

        register(ModuleDef.builder()
                .moduleType("CHANGE_REQUEST")
                .label("คำขอเปลี่ยนแปลง (Change Request)")
                .listRoute("/feature/pm/change-request")
                .createRoute("/feature/pm/change-request/new")
                .schemaDescription("{ \"title\": string, \"description\": string, \"reason\": string, \"priority\": \"High\"|\"Medium\"|\"Low\", \"changeType\": \"Scope\"|\"Schedule\"|\"Cost\"|\"Design\" }")
                .build());

        register(ModuleDef.builder()
                .moduleType("DESIGN_REVIEW")
                .label("ทบทวนการออกแบบ (Design Review)")
                .listRoute("/feature/pm/design-review")
                .createRoute("/feature/pm/design-review/new")
                .schemaDescription("{ \"title\": string, \"description\": string, \"reviewType\": \"Architecture\"|\"UI/UX\"|\"Database\"|\"Security\"|\"Code Review\", \"priority\": \"High\"|\"Medium\"|\"Low\" }")
                .build());

        register(ModuleDef.builder()
                .moduleType("MILESTONE")
                .label("หมุดหมาย (Milestone)")
                .listRoute("/feature/pm/phase")
                .createRoute("/feature/pm/milestone/new")
                .schemaDescription("{ \"milestoneName\": string, \"description\": string, \"dueDate\": \"YYYY-MM-DD\"|null, \"color\": \"#F59E0B\" }")
                .build());

        register(ModuleDef.builder()
                .moduleType("WORK_PACKAGE")
                .label("ชุดงาน (Work Package)")
                .listRoute("/feature/pm/phase")
                .createRoute("/feature/pm/work-package/new")
                .schemaDescription("{ \"packageName\": string, \"description\": string, \"startDate\": \"YYYY-MM-DD\"|null, \"endDate\": \"YYYY-MM-DD\"|null, \"color\": \"#8B5CF6\" }")
                .build());
    }

    private void register(ModuleDef def) {
        modules.put(def.getModuleType(), def);
    }

    public Map<String, ModuleDef> all() {
        return modules;
    }

    public ModuleDef get(String moduleType) {
        return moduleType == null ? null : modules.get(moduleType.trim().toUpperCase());
    }

    public boolean isSupported(String moduleType) {
        return get(moduleType) != null;
    }
}
