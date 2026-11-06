package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.entity.pm.PmCustomer;
import com.softinter.sicapi.entity.pm.PmCustomerContract;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmDelivery;
import com.softinter.sicapi.entity.pm.PmDiagramTab;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.entity.pm.PmSpecification;
import com.softinter.sicapi.entity.pm.PmTask;
import com.softinter.sicapi.entity.pm.PmTestScenario;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.repository.pm.PmDeliveryRepository;
import com.softinter.sicapi.repository.pm.PmDiagramTabRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationRepository;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.pm.PmTestScenarioRepository;
import com.softinter.sicapi.service.PmAiProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AiProjectContextHelper {

    private final PmCustomerRepository customerRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final PmCustomerContractRepository contractRepository;
    private final PmRequirementRepository requirementRepository;
    private final PmSpecificationRepository specificationRepository;
    private final PmDiagramTabRepository diagramRepository;
    private final PmTaskRepository taskRepository;
    private final PmTestScenarioRepository scenarioRepository;
    private final PmDeliveryRepository deliveryRepository;
    private final PmAiProviderService aiProviderService;

    public static final double RELEVANCE_MAX_DISTANCE = 0.35;
    public static final int RELEVANCE_SAFETY_LIMIT = 20;

    public String buildCustomerIndexBlock() {
        UUID bizId = BusinessContextHolder.getBusinessId();
        if (bizId == null) return "";
        List<PmCustomer> customers = customerRepository.findByBusinessIdAndIsActiveTrue(bizId);
        if (customers.isEmpty()) return "";
        StringBuilder sb = new StringBuilder("**Available Customers Index (เลือกอ้างอิงลูกค้าที่เกี่ยวข้องจากรายการนี้):**\n");
        customers.stream().limit(20).forEach(c ->
            sb.append("  * ID: ").append(c.getId())
              .append(" | [").append(c.getCustomerCode()).append("] ")
              .append(c.getCompanyNameLocal() != null ? c.getCompanyNameLocal() : c.getCompanyNameEn())
              .append("\n")
        );
        return sb.append("\n").toString();
    }

    public String buildProjectScopeBlock(UUID projectId) {
        return buildProjectScopeBlock(projectId, null);
    }

    public String buildProjectScopeBlock(UUID projectId, String prompt) {
        if (projectId == null) return "";
        UUID bizId = BusinessContextHolder.getBusinessId();

        StringBuilder sb = new StringBuilder();
        PmCustomerProject project = projectRepository.findById(projectId).orElse(null);
        if (project != null) {
            sb.append("**Project Scope & Document Index (ให้วิเคราะห์คำสั่งผู้ใช้ แล้วเลือกอ้างอิงเฉพาะเอกสารและ UUID ที่เกี่ยวข้องจากสารบัญนี้):**\n")
              .append("- Project: ").append(project.getProjectCode() != null ? project.getProjectCode() + " - " : "")
              .append(project.getProjectName()).append("\n");
            String desc = strip(project.getDescription(), 200);
            if (!desc.isBlank()) {
                sb.append("- Project Overview: ").append(desc).append("\n");
            }
        }

        if (bizId != null) {
            String vecStr = null;
            if (prompt != null && !prompt.isBlank()) {
                float[] vec = aiProviderService.getEmbedding(prompt);
                if (vec != null && vec.length > 0) {
                    vecStr = Arrays.toString(vec);
                }
            }

            List<PmCustomerContract> contracts;
            if (vecStr != null) {
                try {
                    contracts = contractRepository.findTopSimilar(bizId, projectId, vecStr, RELEVANCE_MAX_DISTANCE, RELEVANCE_SAFETY_LIMIT);
                    if (contracts.isEmpty()) {
                        contracts = contractRepository.findByBusinessIdAndProjectIdAndIsDeleteFalseOrderByCreatedDateDesc(bizId, projectId);
                    }
                } catch (Exception e) {
                    contracts = contractRepository.findByBusinessIdAndProjectIdAndIsDeleteFalseOrderByCreatedDateDesc(bizId, projectId);
                }
            } else {
                contracts = contractRepository.findByBusinessIdAndProjectIdAndIsDeleteFalseOrderByCreatedDateDesc(bizId, projectId);
            }
            if (!contracts.isEmpty()) {
                PmCustomerContract c = contracts.get(0);
                sb.append("- Active Contract: ID: ").append(c.getId())
                  .append(" | [").append(c.getContractNo()).append("] (")
                  .append(c.getContractType()).append(", Value: ").append(c.getContractValue()).append(")");
                String scope = strip(c.getScopeSummary(), 100);
                if (!scope.isBlank()) sb.append(" — ").append(scope);
                sb.append("\n");
            }

            List<PmRequirement> reqs;
            if (vecStr != null) {
                try {
                    reqs = requirementRepository.findTopSimilar(bizId, projectId, vecStr, RELEVANCE_MAX_DISTANCE, RELEVANCE_SAFETY_LIMIT);
                } catch (Exception e) {
                    reqs = requirementRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(bizId, projectId);
                }
            } else {
                reqs = requirementRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(bizId, projectId);
            }
            appendSmartIndex(sb, "Project Requirements", reqs, prompt,
                    r -> r.getId().toString(),
                    r -> "[" + r.getRequirementCode() + "] " + r.getTitle(),
                    r -> r.getAcceptanceCriteria() != null ? r.getAcceptanceCriteria() : r.getDescription());

            List<PmSpecification> specs;
            if (vecStr != null) {
                try {
                    specs = specificationRepository.findTopSimilar(bizId, projectId, vecStr, RELEVANCE_MAX_DISTANCE, RELEVANCE_SAFETY_LIMIT);
                } catch (Exception e) {
                    specs = specificationRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(bizId, projectId);
                }
            } else {
                specs = specificationRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(bizId, projectId);
            }
            appendSmartIndex(sb, "Project Specifications", specs, prompt,
                    s -> s.getId().toString(),
                    s -> "[" + s.getSpecificationCode() + "] " + s.getTitle() + " (" + s.getSpecificationType() + ")",
                    PmSpecification::getDescription);

            List<PmDiagramTab> diagrams;
            if (vecStr != null) {
                try {
                    diagrams = diagramRepository.findTopSimilar(projectId, vecStr, RELEVANCE_MAX_DISTANCE, RELEVANCE_SAFETY_LIMIT);
                } catch (Exception e) {
                    diagrams = diagramRepository.findByProjectIdAndIsDeleteFalseOrderBySortOrderAscCreatedDateAsc(projectId);
                }
            } else {
                diagrams = diagramRepository.findByProjectIdAndIsDeleteFalseOrderBySortOrderAscCreatedDateAsc(projectId);
            }
            appendSmartIndex(sb, "Project Diagrams", diagrams, prompt,
                    d -> d.getId().toString(),
                    d -> "[" + d.getDiagramType() + "] " + d.getName(),
                    PmDiagramTab::getMermaidScript);

            List<PmTask> tasks;
            if (vecStr != null) {
                try {
                    tasks = taskRepository.findTopSimilar(projectId, vecStr, RELEVANCE_MAX_DISTANCE, RELEVANCE_SAFETY_LIMIT);
                } catch (Exception e) {
                    tasks = taskRepository.findByWorkPackageMilestonePhaseProjectIdAndIsDeleteFalse(projectId);
                }
            } else {
                tasks = taskRepository.findByWorkPackageMilestonePhaseProjectIdAndIsDeleteFalse(projectId);
            }
            appendSmartIndex(sb, "Project Tasks", tasks, prompt,
                    t -> t.getId().toString(),
                    t -> "[" + t.getTaskCode() + "] " + t.getTaskName(),
                    PmTask::getDescription);

            List<PmTestScenario> scenarios;
            if (vecStr != null) {
                try {
                    scenarios = scenarioRepository.findTopSimilar(bizId, projectId, vecStr, RELEVANCE_MAX_DISTANCE, RELEVANCE_SAFETY_LIMIT);
                } catch (Exception e) {
                    scenarios = scenarioRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(bizId, projectId);
                }
            } else {
                scenarios = scenarioRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(bizId, projectId);
            }
            appendSmartIndex(sb, "Project Test Scenarios", scenarios, prompt,
                    sc -> sc.getId().toString(),
                    PmTestScenario::getScenarioName,
                    PmTestScenario::getDescription);

            List<PmDelivery> deliveries;
            if (vecStr != null) {
                try {
                    deliveries = deliveryRepository.findTopSimilar(bizId, projectId, vecStr, RELEVANCE_MAX_DISTANCE, RELEVANCE_SAFETY_LIMIT);
                } catch (Exception e) {
                    deliveries = deliveryRepository.findByBusinessIdAndProjectIdAndIsDeleteFalseOrderByCreatedDateDesc(bizId, projectId);
                }
            } else {
                deliveries = deliveryRepository.findByBusinessIdAndProjectIdAndIsDeleteFalseOrderByCreatedDateDesc(bizId, projectId);
            }
            appendSmartIndex(sb, "Project Deliveries", deliveries, prompt,
                    d -> d.getId().toString(),
                    d -> "[" + d.getDeliveryCode() + "] " + d.getDeliveryTitle(),
                    PmDelivery::getDeliverySummary);
        }

        if (!sb.isEmpty()) sb.append("\n");
        return sb.toString();
    }

    /**
     * สารบัญเอกสารโครงการ:
     * แสดงเอกสารทุกใบที่ผ่านการกรองความเกี่ยวข้อง พร้อมสรุปย่อ 100 ตัวอักษรเท่ากันหมดทุกใบ
     */
    private <T> void appendSmartIndex(StringBuilder sb, String title, List<T> items, String prompt,
                                      java.util.function.Function<T, String> idFn,
                                      java.util.function.Function<T, String> titleFn,
                                      java.util.function.Function<T, String> descFn) {
        if (items == null || items.isEmpty()) return;

        sb.append("- ").append(title).append(" Index (").append(items.size()).append(" items):\n");
        for (T item : items) {
            sb.append("  * ID: ").append(idFn.apply(item))
              .append(" | ").append(titleFn.apply(item));

            String d = strip(descFn.apply(item), 100);
            if (!d.isBlank()) sb.append(" — ").append(d);
            sb.append("\n");
        }
    }

    public String strip(String html, int maxLen) {
        if (html == null || html.isBlank()) return "";
        String clean = html.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
        return clean.length() <= maxLen ? clean : clean.substring(0, maxLen) + "...";
    }
}
