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
                .schemaDescription("{ \"companyNameLocal\": string, \"companyNameEn\": string, \"taxId\": string|null, \"address\": string|null, \"contactName\": string|null, \"contactPhone\": string|null, \"contactEmail\": string|null }")
                .build());

        register(ModuleDef.builder()
                .moduleType("CONTRACT")
                .label("สัญญา (Contract)")
                .listRoute("/feature/pm/contract")
                .createRoute("/feature/pm/contract/new")
                .schemaDescription("{ \"contractName\": string, \"contractNo\": string|null, \"description\": string, \"contractValue\": number|null, \"startDate\": null, \"endDate\": null }")
                .build());

        register(ModuleDef.builder()
                .moduleType("REQUIREMENT")
                .label("ความต้องการ (Requirement)")
                .listRoute("/feature/pm/requirement")
                .createRoute("/feature/pm/requirement/new")
                .schemaDescription("{ \"requirementName\": string, \"description\": string, \"priority\": \"High\"|\"Medium\"|\"Low\", \"category\": string|null }")
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
                .schemaDescription("{ \"specName\": string, \"description\": string, \"version\": string|null }")
                .build());

        register(ModuleDef.builder()
                .moduleType("USER_MANUAL")
                .label("คู่มือผู้ใช้งาน (User Manual)")
                .listRoute("/feature/pm/manual")
                .createRoute("/feature/pm/manual/new")
                .schemaDescription("{ \"manualTitle\": string, \"description\": string }")
                .build());

        register(ModuleDef.builder()
                .moduleType("DELIVERY")
                .label("การส่งมอบ (Delivery)")
                .listRoute("/feature/pm/delivery")
                .createRoute("/feature/pm/delivery/new")
                .schemaDescription("{ \"deliveryName\": string, \"description\": string, \"deliveryDate\": null }")
                .build());

        register(ModuleDef.builder()
                .moduleType("MA_TICKET")
                .label("MA Ticket")
                .listRoute("/feature/pm/ma-ticket")
                .createRoute("/feature/pm/ma-ticket/new")
                .schemaDescription("{ \"ticketTitle\": string, \"description\": string, \"priority\": \"High\"|\"Medium\"|\"Low\" }")
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
