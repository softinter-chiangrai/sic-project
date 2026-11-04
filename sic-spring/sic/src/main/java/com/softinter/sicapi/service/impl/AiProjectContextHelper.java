package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.config.BusinessContextHolder;
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
import com.softinter.sicapi.repository.pm.PmDeliveryRepository;
import com.softinter.sicapi.repository.pm.PmDiagramTabRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationRepository;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.pm.PmTestScenarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * ตัวช่วยดึงข้อมูลที่เกี่ยวข้องในโปรเจกต์อัตโนมัติ (Smart Context Auto-Resolver)
 * ปอกแท็ก HTML + จัดอันดับตามคำค้นใน Prompt + ตัดความยาวเพื่อประหยัด Token (~300-600 tokens)
 */
@Component
@RequiredArgsConstructor
public class AiProjectContextHelper {

    private final PmCustomerProjectRepository projectRepository;
    private final PmCustomerContractRepository contractRepository;
    private final PmRequirementRepository requirementRepository;
    private final PmSpecificationRepository specificationRepository;
    private final PmDiagramTabRepository diagramRepository;
    private final PmTaskRepository taskRepository;
    private final PmTestScenarioRepository scenarioRepository;
    private final PmDeliveryRepository deliveryRepository;

    public PmRequirement pickBestRequirement(UUID projectId, String prompt) {
        List<PmRequirement> list = pickTopRequirements(projectId, prompt, 1);
        return list.isEmpty() ? null : list.get(0);
    }

    public List<PmRequirement> pickTopRequirements(UUID projectId, String prompt, int limit) {
        UUID bizId = BusinessContextHolder.getBusinessId();
        if (projectId == null || bizId == null) return List.of();
        List<PmRequirement> all = requirementRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(bizId, projectId);
        return rankAndLimit(all, prompt, limit, r -> (r.getRequirementCode() + " " + r.getTitle() + " " + strip(r.getDescription(), 300)));
    }

    public List<PmSpecification> pickTopSpecifications(UUID projectId, String prompt, int limit) {
        UUID bizId = BusinessContextHolder.getBusinessId();
        if (projectId == null || bizId == null) return List.of();
        List<PmSpecification> all = specificationRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(bizId, projectId);
        return rankAndLimit(all, prompt, limit, s -> (s.getSpecificationCode() + " " + s.getTitle() + " " + strip(s.getDescription(), 300)));
    }

    public List<PmDiagramTab> pickTopDiagrams(UUID projectId, String prompt, int limit) {
        if (projectId == null) return List.of();
        List<PmDiagramTab> all = diagramRepository.findByProjectIdAndIsDeleteFalseOrderBySortOrderAscCreatedDateAsc(projectId);
        return rankAndLimit(all, prompt, limit, d -> (d.getName() + " " + d.getDiagramType() + " " + strip(d.getMermaidScript(), 200)));
    }

    public PmTask pickBestTask(UUID projectId, String prompt) {
        if (projectId == null) return null;
        List<PmTask> all = taskRepository.findByWorkPackageMilestonePhaseProjectIdAndIsDeleteFalse(projectId);
        List<PmTask> ranked = rankAndLimit(all, prompt, 1, t -> (t.getTaskCode() + " " + t.getTaskName() + " " + strip(t.getDescription(), 200)));
        return ranked.isEmpty() ? null : ranked.get(0);
    }

    public PmTestScenario pickBestScenario(UUID projectId, String prompt) {
        UUID bizId = BusinessContextHolder.getBusinessId();
        if (projectId == null || bizId == null) return null;
        List<PmTestScenario> all = scenarioRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(bizId, projectId);
        List<PmTestScenario> ranked = rankAndLimit(all, prompt, 1, s -> (s.getScenarioName() + " " + strip(s.getDescription(), 200)));
        return ranked.isEmpty() ? null : ranked.get(0);
    }

    public PmCustomerContract pickBestContract(UUID projectId, String prompt) {
        UUID bizId = BusinessContextHolder.getBusinessId();
        if (projectId == null || bizId == null) return null;
        List<PmCustomerContract> all = contractRepository.findByBusinessIdAndProjectIdAndIsDeleteFalseOrderByCreatedDateDesc(bizId, projectId);
        List<PmCustomerContract> ranked = rankAndLimit(all, prompt, 1, c -> (c.getContractNo() + " " + c.getContractType() + " " + strip(c.getScopeSummary(), 200)));
        return ranked.isEmpty() ? null : ranked.get(0);
    }

    /**
     * สร้างบล็อกสรุปบริบทของโปรเจกต์แบบประหยัด Token (ปอก HTML + คัดเฉพาะตัวที่ตรงคำค้น Top 5)
     * เพื่อให้ AI รู้ขอบเขตเอกสารที่เกี่ยวข้องทั้งหมดในโปรเจกต์โดยอัตโนมัติ
     */
    public String buildProjectScopeBlock(UUID projectId, String prompt) {
        UUID bizId = BusinessContextHolder.getBusinessId();
        if (projectId == null) return "";

        StringBuilder sb = new StringBuilder();
        PmCustomerProject project = projectRepository.findById(projectId).orElse(null);
        if (project != null) {
            sb.append("**Auto-Resolved Project Scope Context:**\n")
              .append("- Project: ").append(project.getProjectCode() != null ? project.getProjectCode() + " - " : "")
              .append(project.getProjectName()).append("\n");
            String desc = strip(project.getDescription(), 250);
            if (!desc.isBlank()) {
                sb.append("- Project Overview: ").append(desc).append("\n");
            }
        }

        if (bizId != null) {
            PmCustomerContract contract = pickBestContract(projectId, prompt);
            if (contract != null) {
                sb.append("- Active Contract: ").append(contract.getContractNo())
                  .append(" (").append(contract.getContractType()).append(", Value: ").append(contract.getContractValue()).append(")\n");
                String scope = strip(contract.getScopeSummary(), 220);
                if (!scope.isBlank()) sb.append("  Contract Scope: ").append(scope).append("\n");
            }

            List<PmRequirement> reqs = pickTopRequirements(projectId, prompt, 5);
            if (!reqs.isEmpty()) {
                sb.append("- Relevant Project Requirements (Top ").append(reqs.size()).append("):\n");
                for (PmRequirement r : reqs) {
                    sb.append("  * [").append(r.getRequirementCode()).append("] ").append(r.getTitle());
                    String ac = strip(r.getAcceptanceCriteria() != null ? r.getAcceptanceCriteria() : r.getDescription(), 180);
                    if (!ac.isBlank()) sb.append(" — ").append(ac);
                    sb.append("\n");
                }
            }

            List<PmSpecification> specs = pickTopSpecifications(projectId, prompt, 5);
            if (!specs.isEmpty()) {
                sb.append("- Relevant Project Specifications (Top ").append(specs.size()).append("):\n");
                for (PmSpecification s : specs) {
                    sb.append("  * [").append(s.getSpecificationCode()).append("] ").append(s.getTitle())
                      .append(" (").append(s.getSpecificationType()).append(")");
                    String sd = strip(s.getDescription(), 160);
                    if (!sd.isBlank()) sb.append(" — ").append(sd);
                    sb.append("\n");
                }
            }

            List<PmDelivery> deliveries = deliveryRepository.findByBusinessIdAndProjectIdAndIsDeleteFalseOrderByCreatedDateDesc(bizId, projectId);
            if (!deliveries.isEmpty()) {
                sb.append("- Project Deliveries: ");
                sb.append(deliveries.stream().limit(4)
                        .map(d -> (d.getDeliveryCode() != null ? d.getDeliveryCode() + ":" : "") + d.getDeliveryTitle())
                        .collect(Collectors.joining(", "))).append("\n");
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

    private <T> List<T> rankAndLimit(List<T> items, String prompt, int limit, Function<T, String> textExtractor) {
        if (items == null || items.isEmpty()) return List.of();
        if (prompt == null || prompt.isBlank()) {
            return items.stream().limit(limit).toList();
        }
        List<String> keywords = Arrays.stream(prompt.toLowerCase().split("[\\s,.;:/\\-()]+"))
                .filter(w -> w.length() >= 2)
                .toList();
        if (keywords.isEmpty()) {
            return items.stream().limit(limit).toList();
        }
        return items.stream()
                .sorted(Comparator.comparingInt((T item) -> -score(textExtractor.apply(item), keywords)))
                .limit(limit)
                .toList();
    }

    private int score(String text, List<String> keywords) {
        if (text == null || text.isBlank()) return 0;
        String lower = text.toLowerCase();
        int hits = 0;
        for (String kw : keywords) {
            if (lower.contains(kw)) hits++;
        }
        return hits;
    }
}
