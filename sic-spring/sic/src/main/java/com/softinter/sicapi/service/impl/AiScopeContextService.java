package com.softinter.sicapi.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmTraceLink;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmDiagramTabRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationRepository;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.pm.PmTestScenarioRepository;
import com.softinter.sicapi.service.TraceLinkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Objects;

/**
 * สร้างบล็อก "บริบทขอบเขต" แบบสรุปสั้นๆ ให้ AI ก่อนเจนเอกสาร: โครงการ, เอกสารที่ผู้ใช้เลือกผูกมา,
 * ความสัมพันธ์ (trace link) ของเอกสารเหล่านั้น และรายชื่อเอกสารอื่นในโครงการ
 * เพื่อให้ AI รู้ว่าเอกสารนี้เกี่ยวกับเรื่องอะไรและไม่เจนเกินขอบเขต
 * ดึงรหัสเอกสารที่ผูกมาจาก request แบบ generic (ชื่อ field ตรงกันทุก DTO) จึงไม่ต้องแก้ DTO ทีละตัว
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiScopeContextService {

    private static final int MAX_LIST = 10;
    private static final int MAX_DESC = 300;
    private static final int MAX_TOTAL = 4000;

    // field ใน request -> ชนิดเอกสารที่ trace link ใช้
    private static final Map<String, String> ANCHOR_FIELDS = Map.of(
            "requirementId", "REQUIREMENT", "requirementIds", "REQUIREMENT",
            "specificationId", "SPECIFICATION", "specificationIds", "SPECIFICATION",
            "diagramId", "DIAGRAM", "diagramIds", "DIAGRAM",
            "scenarioId", "TEST_SCENARIO", "taskId", "TASK");

    private final ObjectMapper objectMapper;
    private final PmCustomerProjectRepository projectRepository;
    private final PmRequirementRepository requirementRepository;
    private final PmSpecificationRepository specificationRepository;
    private final PmDiagramTabRepository diagramRepository;
    private final PmTestScenarioRepository scenarioRepository;
    private final PmTaskRepository taskRepository;
    private final TraceLinkService traceLinkService;

    /** คืนค่าว่างถ้าไม่มี project หรือสร้างบริบทไม่สำเร็จ (ห้ามทำให้การเจนล้ม) */
    public String build(Object request) {
        try {
            Map<String, Object> fields = objectMapper.convertValue(request, new TypeReference<>() {});
            UUID projectId = toUuid(fields.get("projectId"));
            if (projectId == null) {
                return "";
            }
            StringBuilder sb = new StringBuilder("=== DOCUMENT SCOPE CONTEXT (background only) ===\n");
            appendProject(sb, projectId);

            Map<String, Set<UUID>> anchors = new LinkedHashMap<>();
            ANCHOR_FIELDS.forEach((field, type) -> toUuids(fields.get(field))
                    .forEach(id -> anchors.computeIfAbsent(type, k -> new LinkedHashSet<>()).add(id)));
            appendAnchors(sb, anchors);
            appendTrace(sb, anchors);
            appendInventory(sb, projectId);

            sb.append("Rules: Keep the generated content strictly within the scope of this project and the related ")
              .append("documents above. Use their terminology. Do not invent modules, features or entities unrelated ")
              .append("to them. If the user's prompt asks for something outside this scope, follow the prompt but stay consistent with the context.\n");
            return sb.length() > MAX_TOTAL ? sb.substring(0, MAX_TOTAL) : sb.toString();
        } catch (Exception e) {
            log.warn("Could not build AI scope context: {}", e.getMessage());
            return "";
        }
    }

    private void appendProject(StringBuilder sb, UUID projectId) {
        PmCustomerProject p = projectRepository.findById(projectId).orElse(null);
        if (p == null) {
            return;
        }
        sb.append("Project: ").append(nz(p.getProjectCode())).append(" - ").append(nz(p.getProjectName())).append("\n");
        if (p.getDescription() != null && !p.getDescription().isBlank()) {
            sb.append("Project description: ").append(plain(p.getDescription())).append("\n");
        }
    }

    private void appendAnchors(StringBuilder sb, Map<String, Set<UUID>> anchors) {
        List<String> lines = new ArrayList<>();
        anchors.forEach((type, ids) -> ids.forEach(id -> {
            String line = describe(type, id, true);
            if (line != null) {
                lines.add("- [" + type + "] " + line);
            }
        }));
        if (!lines.isEmpty()) {
            sb.append("Documents selected for this draft:\n").append(String.join("\n", lines)).append("\n");
        }
    }

    private void appendTrace(StringBuilder sb, Map<String, Set<UUID>> anchors) {
        List<String> lines = new ArrayList<>();
        anchors.forEach((type, ids) -> ids.forEach(id -> {
            for (PmTraceLink l : traceLinkService.getFullTrace(type, id)) {
                String from = describe(l.getSourceType(), l.getSourceId(), false);
                String to = describe(l.getTargetType(), l.getTargetId(), false);
                if (from != null && to != null) {
                    lines.add("- [" + l.getSourceType() + "] " + from + " --" + l.getRelationshipType() + "--> ["
                            + l.getTargetType() + "] " + to);
                }
            }
        }));
        if (!lines.isEmpty()) {
            sb.append("Linked documents (trace links):\n")
              .append(lines.stream().distinct().limit(MAX_LIST * 2L).collect(Collectors.joining("\n"))).append("\n");
        }
    }

    private void appendInventory(StringBuilder sb, UUID projectId) {
        UUID biz = BusinessContextHolder.getBusinessId();
        inventory(sb, "Requirements", requirementRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(biz, projectId)
                .stream().map(r -> nz(r.getRequirementCode()) + " " + nz(r.getTitle())).toList());
        inventory(sb, "Specifications", specificationRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(biz, projectId)
                .stream().map(s -> nz(s.getSpecificationCode()) + " " + nz(s.getTitle())).toList());
        inventory(sb, "Diagrams", diagramRepository
                .findByBusinessIdAndProjectIdAndIsDeleteFalseOrderBySortOrderAscCreatedDateAsc(biz, projectId)
                .stream().map(d -> nz(d.getDiagramCode()) + " " + nz(d.getName())).toList());
        inventory(sb, "Test scenarios", scenarioRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(biz, projectId)
                .stream().map(s -> nz(s.getScenarioCode()) + " " + nz(s.getScenarioName())).toList());
    }

    private void inventory(StringBuilder sb, String label, List<String> items) {
        if (!items.isEmpty()) {
            sb.append("Other ").append(label).append(" in this project (").append(items.size()).append("): ")
              .append(items.stream().limit(MAX_LIST).collect(Collectors.joining("; ")))
              .append(items.size() > MAX_LIST ? "; ..." : "").append("\n");
        }
    }

    /** รหัส + ชื่อ (+ รายละเอียดสั้นๆ ถ้า withDescription) หรือ null ถ้าไม่พบ/ไม่รู้จักชนิด */
    private String describe(String type, UUID id, boolean withDescription) {
        if (type == null || id == null) {
            return null;
        }
        String head;
        String desc = null;
        switch (type.toUpperCase()) {
            case "REQUIREMENT" -> {
                var r = requirementRepository.findById(id).orElse(null);
                if (r == null) return null;
                head = nz(r.getRequirementCode()) + " " + nz(r.getTitle());
                desc = r.getDescription();
            }
            case "SPECIFICATION", "SPEC" -> {
                var s = specificationRepository.findById(id).orElse(null);
                if (s == null) return null;
                head = nz(s.getSpecificationCode()) + " " + nz(s.getTitle());
                desc = s.getDescription();
            }
            case "DIAGRAM", "DFD", "ER" -> {
                var d = diagramRepository.findById(id).orElse(null);
                if (d == null) return null;
                head = nz(d.getDiagramCode()) + " " + nz(d.getName());
            }
            case "TEST_SCENARIO" -> {
                var s = scenarioRepository.findById(id).orElse(null);
                if (s == null) return null;
                head = nz(s.getScenarioCode()) + " " + nz(s.getScenarioName());
                desc = s.getDescription();
            }
            case "TASK" -> {
                var t = taskRepository.findById(id).orElse(null);
                if (t == null) return null;
                head = nz(t.getTaskCode()) + " " + nz(t.getTaskName());
                desc = t.getDescription();
            }
            default -> {
                return null;
            }
        }
        head = head.trim();
        return withDescription && desc != null && !desc.isBlank() ? head + ": " + plain(desc) : head;
    }

    private static String plain(String html) {
        String text = html.replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").trim();
        return text.length() > MAX_DESC ? text.substring(0, MAX_DESC) + "..." : text;
    }

    private static String nz(String s) {
        return s == null ? "" : s;
    }

    private static UUID toUuid(Object o) {
        try {
            return o == null || o.toString().isBlank() ? null : UUID.fromString(o.toString());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private static List<UUID> toUuids(Object o) {
        if (o instanceof List<?> list) {
            return list.stream().map(AiScopeContextService::toUuid).filter(Objects::nonNull).toList();
        }
        UUID single = toUuid(o);
        return single == null ? List.of() : List.of(single);
    }
}
