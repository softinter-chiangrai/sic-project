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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * สร้าง "สารบัญย่อทั้งโปรเจกต์" (One-Shot Project Index Menu)
 * ส่งรายชื่อเอกสารทุกใบในโปรเจกต์ (พร้อม UUID + รหัส + ชื่อเรื่อง + สรุปย่อ 100 ตัวอักษร)
 * ให้ AI เป็นคนวิเคราะห์และเลือกอ้างอิงเอง 100% โดยไม่ใช้ระบบเทียบคำใน Java
 */
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

    public String buildProjectScopeBlock(UUID projectId, String unusedPrompt) {
        return buildProjectScopeBlock(projectId);
    }

    public String buildProjectScopeBlock(UUID projectId) {
        UUID bizId = BusinessContextHolder.getBusinessId();
        if (projectId == null) return "";

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
            List<PmCustomerContract> contracts = contractRepository.findByBusinessIdAndProjectIdAndIsDeleteFalseOrderByCreatedDateDesc(bizId, projectId);
            if (!contracts.isEmpty()) {
                PmCustomerContract c = contracts.get(0);
                sb.append("- Active Contract: ID: ").append(c.getId())
                  .append(" | [").append(c.getContractNo()).append("] (")
                  .append(c.getContractType()).append(", Value: ").append(c.getContractValue()).append(")");
                String scope = strip(c.getScopeSummary(), 100);
                if (!scope.isBlank()) sb.append(" — ").append(scope);
                sb.append("\n");
            }

            List<PmRequirement> reqs = requirementRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(bizId, projectId);
            if (!reqs.isEmpty()) {
                sb.append("- Project Requirements Index (").append(reqs.size()).append(" items):\n");
                reqs.stream().limit(30).forEach(r -> {
                    sb.append("  * ID: ").append(r.getId())
                      .append(" | [").append(r.getRequirementCode()).append("] ").append(r.getTitle());
                    String ac = strip(r.getAcceptanceCriteria() != null ? r.getAcceptanceCriteria() : r.getDescription(), 100);
                    if (!ac.isBlank()) sb.append(" — ").append(ac);
                    sb.append("\n");
                });
            }

            List<PmSpecification> specs = specificationRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(bizId, projectId);
            if (!specs.isEmpty()) {
                sb.append("- Project Specifications Index (").append(specs.size()).append(" items):\n");
                specs.stream().limit(30).forEach(s -> {
                    sb.append("  * ID: ").append(s.getId())
                      .append(" | [").append(s.getSpecificationCode()).append("] ").append(s.getTitle())
                      .append(" (").append(s.getSpecificationType()).append(")");
                    String sd = strip(s.getDescription(), 100);
                    if (!sd.isBlank()) sb.append(" — ").append(sd);
                    sb.append("\n");
                });
            }

            List<PmDiagramTab> diagrams = diagramRepository.findByProjectIdAndIsDeleteFalseOrderBySortOrderAscCreatedDateAsc(projectId);
            if (!diagrams.isEmpty()) {
                sb.append("- Project Diagrams Index (").append(diagrams.size()).append(" items):\n");
                diagrams.stream().limit(20).forEach(d -> {
                    sb.append("  * ID: ").append(d.getId())
                      .append(" | [").append(d.getDiagramType()).append("] ").append(d.getName());
                    String ms = strip(d.getMermaidScript(), 100);
                    if (!ms.isBlank()) sb.append(" — ").append(ms);
                    sb.append("\n");
                });
            }

            List<PmTask> tasks = taskRepository.findByWorkPackageMilestonePhaseProjectIdAndIsDeleteFalse(projectId);
            if (!tasks.isEmpty()) {
                sb.append("- Project Tasks Index (").append(tasks.size()).append(" items):\n");
                tasks.stream().limit(30).forEach(t -> {
                    sb.append("  * ID: ").append(t.getId())
                      .append(" | [").append(t.getTaskCode()).append("] ").append(t.getTaskName());
                    String td = strip(t.getDescription(), 100);
                    if (!td.isBlank()) sb.append(" — ").append(td);
                    sb.append("\n");
                });
            }

            List<PmTestScenario> scenarios = scenarioRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(bizId, projectId);
            if (!scenarios.isEmpty()) {
                sb.append("- Project Test Scenarios Index (").append(scenarios.size()).append(" items):\n");
                scenarios.stream().limit(20).forEach(sc -> {
                    sb.append("  * ID: ").append(sc.getId())
                      .append(" | ").append(sc.getScenarioName());
                    String scd = strip(sc.getDescription(), 100);
                    if (!scd.isBlank()) sb.append(" — ").append(scd);
                    sb.append("\n");
                });
            }

            List<PmDelivery> deliveries = deliveryRepository.findByBusinessIdAndProjectIdAndIsDeleteFalseOrderByCreatedDateDesc(bizId, projectId);
            if (!deliveries.isEmpty()) {
                sb.append("- Project Deliveries Index:\n");
                deliveries.stream().limit(10).forEach(d ->
                    sb.append("  * ID: ").append(d.getId())
                      .append(" | [").append(d.getDeliveryCode()).append("] ").append(d.getDeliveryTitle()).append("\n")
                );
            }
        }

        if (!sb.isEmpty()) sb.append("\n");
        return sb.toString();
    }

    public String strip(String html, int maxLen) {
        if (html == null || html.isBlank()) return "";
        String clean = html.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
        return clean.length() <= maxLen ? clean : clean.substring(0, maxLen) + "...";
    }
}
