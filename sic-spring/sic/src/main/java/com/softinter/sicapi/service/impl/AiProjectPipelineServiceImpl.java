package com.softinter.sicapi.service.impl;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.request.AiProjectPipelineRequest;
import com.softinter.sicapi.dto.response.AiProjectPipelineExecuteResponse;
import com.softinter.sicapi.dto.response.AiProjectPipelinePreviewResponse;
import com.softinter.sicapi.entity.pm.*;
import com.softinter.sicapi.repository.pm.*;
import com.softinter.sicapi.service.AiProjectPipelineService;
import com.softinter.sicapi.service.PmAiProviderService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiProjectPipelineServiceImpl implements AiProjectPipelineService {

    private final PmAiProviderService aiProviderService;
    private final PmCustomerProjectRepository projectRepository;
    private final PmCustomerRepository customerRepository;
    private final PmRequirementRepository requirementRepository;
    private final PmSpecificationRepository specificationRepository;
    private final PmTaskRepository taskRepository;
    private final PmPhaseRepository phaseRepository;
    private final PmDeliveryRepository deliveryRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Pattern JSON_PATTERN = Pattern.compile("```json\\s*([\\s\\S]*?)```");

    @Override
    public AiProjectPipelinePreviewResponse generatePreview(AiProjectPipelineRequest request, UUID businessId) {
        String systemPrompt = """
                You are a Lead Enterprise Software Architect & Project Director.
                Your task is to decompose the user's project request into an end-to-end full project breakdown for the SIC Enterprise PM System.

                RULES:
                1. Respond strictly in valid JSON format inside a ```json ``` block.
                2. Do not include extraneous text outside the JSON block.
                3. The JSON MUST follow this structure:
                {
                  "projectName": "Professional project title in Thai/English",
                  "description": "Comprehensive project charter & objectives in Thai/English",
                  "estimatedDurationWeeks": 12,
                  "requirements": [
                    {
                      "title": "Requirement Title",
                      "description": "Requirement details",
                      "type": "FUNCTIONAL",
                      "priority": "HIGH",
                      "businessValue": "High customer retention"
                    }
                  ],
                  "specifications": [
                    {
                      "title": "Spec / Feature Module Title",
                      "specificationType": "SYSTEM_DESIGN",
                      "priority": "HIGH",
                      "estimatedManday": 10,
                      "description": "Detailed functional specification"
                    }
                  ],
                  "tasks": [
                    {
                      "taskName": "Task title",
                      "description": "Implementation details",
                      "estimateManday": 3,
                      "weekOffset": 1,
                      "durationDays": 5
                    }
                  ],
                  "phases": [
                    {
                      "phaseName": "Phase 1: Inception & Analysis",
                      "weekStart": 1,
                      "weekEnd": 3,
                      "color": "#3B82F6"
                    },
                    {
                      "phaseName": "Phase 2: Core Development",
                      "weekStart": 4,
                      "weekEnd": 9,
                      "color": "#10B981"
                    },
                    {
                      "phaseName": "Phase 3: Testing & Delivery",
                      "weekStart": 10,
                      "weekEnd": 12,
                      "color": "#8B5CF6"
                    }
                  ],
                  "deliveries": [
                    {
                      "deliveryTitle": "Milestone Delivery 1 - MVP Release",
                      "deliveryType": "MILESTONE",
                      "summary": "Core features delivery"
                    },
                    {
                      "deliveryTitle": "Final Acceptance & Go-Live",
                      "deliveryType": "FINAL",
                      "summary": "Complete system deployment and sign-off"
                    }
                  ]
                }
                """;

        String userPrompt = "รายละเอียดโครงการที่ต้องการสร้าง: " + (request.getPrompt() != null ? request.getPrompt() : request.getProjectName())
                + (request.getDurationWeeks() != null ? "\nระยะเวลาเป้าหมาย: " + request.getDurationWeeks() + " สัปดาห์" : "");

        try {
            String raw = aiProviderService.generateRawResponse(userPrompt, systemPrompt, request.getModel(), request.getAttachments());
            JsonNode root = parseJsonRoot(raw);
            if (root != null) {
                return AiProjectPipelinePreviewResponse.builder()
                        .projectName(root.path("projectName").asText(request.getProjectName() != null ? request.getProjectName() : "New AI Project"))
                        .description(root.path("description").asText(""))
                        .estimatedDurationWeeks(root.path("estimatedDurationWeeks").asInt(request.getDurationWeeks() != null ? request.getDurationWeeks() : 12))
                        .previewRequirements(toList(root.path("requirements")))
                        .previewSpecifications(toList(root.path("specifications")))
                        .previewTasks(toList(root.path("tasks")))
                        .previewPhases(toList(root.path("phases")))
                        .previewDeliveries(toList(root.path("deliveries")))
                        .message("สร้างโครงสร้างโครงการตัวอย่างเรียบร้อย พร้อมดำเนินการต่อ")
                        .build();
            }
        } catch (Exception e) {
            log.error("Failed to generate project preview", e);
        }

        // Fallback response
        return buildFallbackPreview(request);
    }

    @Override
    @Transactional
    public AiProjectPipelineExecuteResponse executePipeline(AiProjectPipelineRequest request, UUID businessId, String userId) {
        log.info("Executing End-to-End AI Project Pipeline for businessId: {}, prompt: {}", businessId, request.getPrompt());

        // 1. Generate Decomposition Plan
        AiProjectPipelinePreviewResponse plan = generatePreview(request, businessId);

        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        int weeks = plan.getEstimatedDurationWeeks() != null && plan.getEstimatedDurationWeeks() > 0 ? plan.getEstimatedDurationWeeks() : 12;
        LocalDate endDate = startDate.plusWeeks(weeks);

        // 2. Resolve or fallback Customer
        UUID customerId = request.getCustomerId();
        if (customerId == null) {
            // Find first available customer in business or create default
            List<PmCustomer> customers = customerRepository.findByBusinessIdAndIsActiveTrue(businessId);
            if (!customers.isEmpty()) {
                customerId = customers.get(0).getId();
            }
        }

        // 3. Create Project
        String projectCode = "PRJ-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + String.format("%03d", (int)(Math.random() * 1000));
        PmCustomerProject project = new PmCustomerProject();
        project.setBusinessId(businessId);
        project.setCustomerId(customerId);
        project.setProjectCode(projectCode);
        project.setProjectName(plan.getProjectName());
        project.setDescription(plan.getDescription());
        project.setStartDate(startDate);
        project.setPlannedEndDate(endDate);
        project.setStatus("Planning");
        project = projectRepository.save(project);

        Map<String, Integer> counts = new HashMap<>();

        // 4. Create Requirements
        List<PmRequirement> savedReqs = new ArrayList<>();
        if (Boolean.TRUE.equals(request.getIncludeRequirements()) && plan.getPreviewRequirements() != null) {
            int reqIdx = 1;
            for (Map<String, Object> reqData : plan.getPreviewRequirements()) {
                PmRequirement req = new PmRequirement();
                req.setBusinessId(businessId);
                req.setProjectId(project.getId());
                req.setRequirementCode(String.format("REQ-%03d", reqIdx++));
                req.setTitle(String.valueOf(reqData.getOrDefault("title", "Requirement " + reqIdx)));
                req.setDescription(String.valueOf(reqData.getOrDefault("description", "")));
                req.setRequirementType(String.valueOf(reqData.getOrDefault("type", "FUNCTIONAL")));
                req.setPriority(String.valueOf(reqData.getOrDefault("priority", "HIGH")));
                req.setBusinessValue(String.valueOf(reqData.getOrDefault("businessValue", "")));
                req.setStatus("DRAFT");
                req.setIsActive(true);
                savedReqs.add(requirementRepository.save(req));
            }
            counts.put("requirements", savedReqs.size());
        }

        // 5. Create Specifications
        List<PmSpecification> savedSpecs = new ArrayList<>();
        if (Boolean.TRUE.equals(request.getIncludeSpecifications()) && plan.getPreviewSpecifications() != null) {
            int specIdx = 1;
            for (Map<String, Object> specData : plan.getPreviewSpecifications()) {
                PmSpecification spec = new PmSpecification();
                spec.setBusinessId(businessId);
                spec.setProject(project);
                spec.setSpecificationCode(String.format("SPEC-%03d", specIdx++));
                spec.setTitle(String.valueOf(specData.getOrDefault("title", "Specification " + specIdx)));
                spec.setSpecificationType(String.valueOf(specData.getOrDefault("specificationType", "SYSTEM_DESIGN")));
                spec.setDescription(String.valueOf(specData.getOrDefault("description", "")));
                spec.setStatus("Draft");
                spec.setPriority(String.valueOf(specData.getOrDefault("priority", "Medium")));
                if (!savedReqs.isEmpty()) {
                    spec.setRequirement(savedReqs.get((specIdx - 1) % savedReqs.size()));
                }
                savedSpecs.add(specificationRepository.save(spec));
            }
            counts.put("specifications", savedSpecs.size());
        }

        // 6. Create Gantt Phases
        List<PmPhase> savedPhases = new ArrayList<>();
        if (Boolean.TRUE.equals(request.getIncludeGanttPhases()) && plan.getPreviewPhases() != null) {
            int phaseIdx = 1;
            for (Map<String, Object> phaseData : plan.getPreviewPhases()) {
                PmPhase phase = new PmPhase();
                phase.setProject(project);
                phase.setPhaseCode(String.format("PHS-%02d", phaseIdx++));
                phase.setPhaseName(String.valueOf(phaseData.getOrDefault("phaseName", "Phase " + phaseIdx)));
                int wStart = getInt(phaseData.get("weekStart"), 1);
                int wEnd = getInt(phaseData.get("weekEnd"), 4);
                phase.setStartDate(startDate.plusWeeks(wStart - 1));
                phase.setEndDate(startDate.plusWeeks(wEnd));
                phase.setColor(String.valueOf(phaseData.getOrDefault("color", "#3B82F6")));
                phase.setStatus("Not Started");
                phase.setProgress(0);
                savedPhases.add(phaseRepository.save(phase));
            }
            counts.put("phases", savedPhases.size());
        }

        // 7. Create Tasks
        if (Boolean.TRUE.equals(request.getIncludeTasks()) && plan.getPreviewTasks() != null) {
            int taskIdx = 1;
            for (Map<String, Object> taskData : plan.getPreviewTasks()) {
                PmTask task = new PmTask();
                task.setBusinessId(businessId);
                task.setTaskCode(String.format("TSK-%03d", taskIdx++));
                task.setTaskName(String.valueOf(taskData.getOrDefault("taskName", "Task " + taskIdx)));
                task.setDescription(String.valueOf(taskData.getOrDefault("description", "")));
                int offset = getInt(taskData.get("weekOffset"), 1);
                int duration = getInt(taskData.get("durationDays"), 5);
                task.setStartDate(startDate.plusWeeks(offset - 1));
                task.setEndDate(task.getStartDate().plusDays(duration));
                task.setEstimateManday(getInt(taskData.get("estimateManday"), 3));
                if (!savedSpecs.isEmpty()) {
                    task.setSpecification(savedSpecs.get((taskIdx - 1) % savedSpecs.size()));
                }
                taskRepository.save(task);
            }
            counts.put("tasks", plan.getPreviewTasks().size());
        }

        // 8. Create Deliveries
        if (Boolean.TRUE.equals(request.getIncludeDelivery()) && plan.getPreviewDeliveries() != null) {
            int delIdx = 1;
            for (Map<String, Object> delData : plan.getPreviewDeliveries()) {
                PmDelivery delivery = new PmDelivery();
                delivery.setBusinessId(businessId);
                delivery.setProjectId(project.getId());
                delivery.setDeliveryCode(String.format("DEL-%03d", delIdx++));
                delivery.setDeliveryTitle(String.valueOf(delData.getOrDefault("deliveryTitle", "Delivery " + delIdx)));
                delivery.setDeliveryType(String.valueOf(delData.getOrDefault("deliveryType", "FINAL")));
                delivery.setDeliverySummary(String.valueOf(delData.getOrDefault("summary", "")));
                delivery.setDeliveryDate(endDate.minusDays((plan.getPreviewDeliveries().size() - delIdx) * 14L));
                delivery.setStatus("DRAFT");
                deliveryRepository.save(delivery);
            }
            counts.put("deliveries", plan.getPreviewDeliveries().size());
        }

        return AiProjectPipelineExecuteResponse.builder()
                .projectId(project.getId())
                .projectCode(project.getProjectCode())
                .projectName(project.getProjectName())
                .status("CREATED_DRAFT")
                .createdCounts(counts)
                .message("สร้างโครงสร้างโครงการและโมดูลทั้งหมดสำเร็จสมบูรณ์ พร้อมให้ตรวจสอบ")
                .success(true)
                .build();
    }

    private JsonNode parseJsonRoot(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try {
            String jsonStr = raw;
            Matcher matcher = JSON_PATTERN.matcher(raw);
            if (matcher.find()) {
                jsonStr = matcher.group(1).trim();
            }
            return objectMapper.readTree(jsonStr);
        } catch (Exception e) {
            log.warn("Failed to parse JSON root from raw AI response: {}", e.getMessage());
            return null;
        }
    }

    private List<Map<String, Object>> toList(JsonNode node) {
        if (node == null || !node.isArray()) return List.of();
        try {
            return objectMapper.convertValue(node, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private int getInt(Object val, int fallback) {
        if (val == null) return fallback;
        if (val instanceof Number) return ((Number) val).intValue();
        try {
            return Integer.parseInt(val.toString());
        } catch (Exception e) {
            return fallback;
        }
    }

    private AiProjectPipelinePreviewResponse buildFallbackPreview(AiProjectPipelineRequest req) {
        String name = req.getProjectName() != null && !req.getProjectName().isBlank() ? req.getProjectName() : "ระบบบริหารจัดการองค์กรอัจฉริยะ (AI Generated)";
        return AiProjectPipelinePreviewResponse.builder()
                .projectName(name)
                .description("<p>โครงการพัฒนาระบบบริหารจัดการครบวงจรเพื่อยกระดับประสิทธิภาพการทำงานขององค์กร</p>")
                .estimatedDurationWeeks(req.getDurationWeeks() != null ? req.getDurationWeeks() : 12)
                .previewRequirements(List.of(
                        Map.of("title", "ระบบจัดการข้อมูลหลักและสิทธิ์ผู้ใช้งาน", "type", "FUNCTIONAL", "priority", "HIGH"),
                        Map.of("title", "ระบบวิเคราะห์และประมวลผลข้อมูล", "type", "FUNCTIONAL", "priority", "HIGH"),
                        Map.of("title", "ระบบรายงานและ Dashboard ผู้บริหาร", "type", "FUNCTIONAL", "priority", "MEDIUM")
                ))
                .previewSpecifications(List.of(
                        Map.of("title", "โมดูลจัดการ Authentication & RBAC", "specificationType", "SYSTEM_DESIGN", "priority", "HIGH"),
                        Map.of("title", "โมดูล Data Engine & Pipeline API", "specificationType", "SYSTEM_DESIGN", "priority", "HIGH"),
                        Map.of("title", "โมดูล Executive Dashboard & Export", "specificationType", "SYSTEM_DESIGN", "priority", "MEDIUM")
                ))
                .previewTasks(List.of(
                        Map.of("taskName", "ออกแบบ Database Schema & Entities", "estimateManday", 3, "weekOffset", 1, "durationDays", 5),
                        Map.of("taskName", "พัฒนา REST APIs & Business Logic", "estimateManday", 8, "weekOffset", 2, "durationDays", 10),
                        Map.of("taskName", "พัฒนา User Interface & Dashboard", "estimateManday", 6, "weekOffset", 4, "durationDays", 10),
                        Map.of("taskName", "ทดสอบระบบและทำ UAT", "estimateManday", 4, "weekOffset", 8, "durationDays", 5)
                ))
                .previewPhases(List.of(
                        Map.of("phaseName", "Phase 1: Planning & Architecture", "weekStart", 1, "weekEnd", 3, "color", "#3B82F6"),
                        Map.of("phaseName", "Phase 2: Core Development", "weekStart", 4, "weekEnd", 8, "color", "#10B981"),
                        Map.of("phaseName", "Phase 3: Testing & Delivery", "weekStart", 9, "weekEnd", 12, "color", "#8B5CF6")
                ))
                .previewDeliveries(List.of(
                        Map.of("deliveryTitle", "งวดที่ 1: เอกสารออกแบบและโครงสร้างระบบ", "deliveryType", "PARTIAL", "summary", "System Architecture & Specs"),
                        Map.of("deliveryTitle", "งวดที่ 2: ระบบเวอร์ชันสมบูรณ์พร้อมคู่มือ", "deliveryType", "FINAL", "summary", "Production Deployment")
                ))
                .message("สร้างโครงสร้างโครงการตัวอย่างเรียบร้อย (Heuristic fallback)")
                .build();
    }
}
