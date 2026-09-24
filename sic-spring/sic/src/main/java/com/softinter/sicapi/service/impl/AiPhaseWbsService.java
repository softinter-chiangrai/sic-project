package com.softinter.sicapi.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.request.AiPhaseWbsRequest;
import com.softinter.sicapi.dto.request.MilestoneRequest;
import com.softinter.sicapi.dto.request.TaskRequest;
import com.softinter.sicapi.dto.request.WorkPackageRequest;
import com.softinter.sicapi.dto.response.AiPhaseWbsResponse;
import com.softinter.sicapi.dto.response.MilestoneResponse;
import com.softinter.sicapi.dto.response.PhaseResponse;
import com.softinter.sicapi.dto.response.WorkPackageResponse;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.service.CurrentUserService;
import com.softinter.sicapi.service.MilestoneService;
import com.softinter.sicapi.service.PhaseService;
import com.softinter.sicapi.service.PmAiProviderService;
import com.softinter.sicapi.service.TaskService;
import com.softinter.sicapi.service.WorkPackageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * ให้ AI สร้าง Milestone -> Work Package -> Task ใต้ Phase ที่เปิดอยู่ในครั้งเดียว (เพิ่มอย่างเดียว ไม่แก้/ทับของเดิม)
 * ส่งโครงสร้างเดิมของ Phase ให้ AI เห็นเพื่อไม่สร้างซ้ำ และบังคับวันที่ให้อยู่ในช่วงของ Phase
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiPhaseWbsService {

    private final PhaseService phaseService;
    private final MilestoneService milestoneService;
    private final WorkPackageService workPackageService;
    private final TaskService taskService;
    private final PmTaskRepository taskRepository;
    private final PmAiProviderService aiProvider;
    private final CurrentUserService currentUserService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final Pattern JSON_PATTERN = Pattern.compile("```json\\s*([\\s\\S]*?)```");
    private static final Set<String> PRIORITIES = Set.of("Critical", "High", "Medium", "Low");

    public AiPhaseWbsResponse generate(AiPhaseWbsRequest request) {
        PhaseResponse phase = phaseService.getPhaseById(request.getPhaseId());
        LocalDate phaseStart = phase.getStartDate() != null ? phase.getStartDate() : LocalDate.now();
        LocalDate phaseEnd = phase.getEndDate() != null && !phase.getEndDate().isBefore(phaseStart)
                ? phase.getEndDate() : phaseStart.plusWeeks(4);

        JsonNode root = askAi(request, phase, phaseStart, phaseEnd);
        if (root == null || !root.path("milestones").isArray() || root.path("milestones").isEmpty()) {
            return AiPhaseWbsResponse.builder().message("AI ไม่สามารถสร้างโครงสร้างงานได้ กรุณาลองใหม่หรือปรับคำสั่ง").build();
        }

        UUID businessId = currentUserService.getBusinessId();
        long taskBase = businessId != null ? taskRepository.countByBusinessIdAndIsDeleteFalse(businessId) : 0;
        int msCount = 0;
        int wpCount = 0;
        int taskCount = 0;

        for (JsonNode ms : root.path("milestones")) {
            String msName = text(ms, "milestoneName");
            if (msName == null) continue;
            MilestoneRequest mq = new MilestoneRequest();
            mq.setPhaseId(phase.getId());
            mq.setMilestoneName(cut(msName, 255));
            mq.setDescription(text(ms, "description"));
            mq.setDueDate(clamp(date(ms, "dueDate", phaseEnd), phaseStart, phaseEnd));
            mq.setColor(firstNonBlank(text(ms, "color"), phase.getColor(), "#3B82F6"));
            MilestoneResponse milestone = milestoneService.createMilestone(mq);
            msCount++;

            for (JsonNode wp : ms.path("workPackages")) {
                String wpName = text(wp, "packageName");
                if (wpName == null) continue;
                WorkPackageRequest wq = new WorkPackageRequest();
                wq.setMilestoneId(milestone.getId());
                wq.setPackageName(cut(wpName, 255));
                wq.setDescription(text(wp, "description"));
                wq.setStartDate(clamp(date(wp, "startDate", phaseStart), phaseStart, phaseEnd));
                wq.setEndDate(clamp(date(wp, "endDate", phaseEnd), wq.getStartDate(), phaseEnd));
                wq.setColor(mq.getColor());
                WorkPackageResponse workPackage = workPackageService.createWorkPackage(wq);
                wpCount++;

                for (JsonNode t : wp.path("tasks")) {
                    String tName = text(t, "taskName");
                    if (tName == null) continue;
                    TaskRequest tq = new TaskRequest();
                    tq.setWorkPackageId(workPackage.getId());
                    tq.setTaskCode(String.format("TSK-%03d", taskBase + taskCount + 1));
                    tq.setTaskName(cut(tName, 255));
                    tq.setDescription(text(t, "description"));
                    LocalDate start = clamp(date(t, "startDate", wq.getStartDate()), phaseStart, phaseEnd);
                    tq.setStartDate(start);
                    tq.setEndDate(clamp(date(t, "endDate", start.plusDays(3)), start, phaseEnd));
                    tq.setEstimateManday(Math.max(1, t.path("estimateManday").asInt(2)));
                    tq.setPriority(pick(text(t, "priority"), PRIORITIES, "Medium"));
                    tq.setColor(mq.getColor());
                    taskService.createTask(tq);
                    taskCount++;
                }
            }
        }

        return AiPhaseWbsResponse.builder().milestones(msCount).workPackages(wpCount).tasks(taskCount)
                .message("สร้าง " + msCount + " Milestone, " + wpCount + " Work Package, " + taskCount + " Task เรียบร้อยแล้ว").build();
    }

    private JsonNode askAi(AiPhaseWbsRequest request, PhaseResponse phase, LocalDate start, LocalDate end) {
        String system = """
                You are a Senior Project Manager. Break the given project phase into Milestones, Work Packages and Tasks.
                Limits: max 3 milestones, max 2 work packages per milestone, max 3 tasks per work package.
                Do NOT repeat anything that already exists in the phase. Fill EVERY field. All dates use yyyy-MM-dd and MUST be within the phase date range.
                priority is one of: Critical | High | Medium | Low.
                Respond ONLY with valid JSON in a ```json block, in the same language as the phase/user request:
                { "milestones": [ { "milestoneName": "...", "description": "...", "dueDate": "yyyy-MM-dd", "color": "#3B82F6",
                    "workPackages": [ { "packageName": "...", "description": "...", "startDate": "yyyy-MM-dd", "endDate": "yyyy-MM-dd",
                        "tasks": [ { "taskName": "...", "description": "...", "startDate": "yyyy-MM-dd", "endDate": "yyyy-MM-dd",
                            "estimateManday": 2, "priority": "Medium" } ] } ] } ] }
                """;

        StringBuilder user = new StringBuilder();
        user.append("Phase: ").append(phase.getPhaseName()).append("\n");
        if (phase.getDescription() != null) user.append("Description: ").append(phase.getDescription()).append("\n");
        user.append("Project: ").append(phase.getProjectName()).append("\n");
        user.append("Phase date range: ").append(start).append(" to ").append(end).append("\n");
        user.append("Existing structure (do not duplicate):\n");
        List<String> existing = new ArrayList<>();
        if (phase.getMilestones() != null) {
            for (MilestoneResponse m : phase.getMilestones()) {
                existing.add("- Milestone: " + m.getMilestoneName());
                if (m.getWorkPackages() != null) {
                    for (WorkPackageResponse w : m.getWorkPackages()) existing.add("  - Work Package: " + w.getPackageName());
                }
            }
        }
        user.append(existing.isEmpty() ? "(none)\n" : String.join("\n", existing) + "\n");
        if (request.getPrompt() != null && !request.getPrompt().isBlank()) {
            user.append("\nUser instructions: ").append(request.getPrompt().trim()).append("\n");
        }

        try {
            String raw = aiProvider.generateRawResponse(user.toString(), system, request.getModel());
            if (raw == null || raw.isBlank() || "{}".equals(raw.trim())) return null;
            Matcher m = JSON_PATTERN.matcher(raw);
            String json;
            if (m.find()) {
                json = m.group(1).trim();
            } else {
                json = raw.trim();
                int s = json.indexOf('{');
                int e = json.lastIndexOf('}');
                if (s >= 0 && e > s) json = json.substring(s, e + 1);
            }
            return objectMapper.readTree(json);
        } catch (Exception e) {
            log.warn("AI phase WBS: cannot parse AI response: {}", e.getMessage());
            return null;
        }
    }

    private static String text(JsonNode n, String field) {
        if (n == null || n.path(field).isMissingNode() || n.path(field).isNull()) return null;
        String v = n.path(field).asText(null);
        return v == null || v.isBlank() ? null : v.trim();
    }

    private static LocalDate date(JsonNode n, String field, LocalDate fallback) {
        String v = text(n, field);
        if (v == null) return fallback;
        try {
            return LocalDate.parse(v.length() > 10 ? v.substring(0, 10) : v);
        } catch (Exception e) {
            return fallback;
        }
    }

    private static LocalDate clamp(LocalDate d, LocalDate min, LocalDate max) {
        if (d.isBefore(min)) return min;
        if (d.isAfter(max)) return max;
        return d;
    }

    private static String cut(String v, int max) {
        return v.length() <= max ? v : v.substring(0, max);
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) if (v != null && !v.isBlank()) return v;
        return null;
    }

    private static String pick(String value, Set<String> allowed, String fallback) {
        if (value != null) {
            for (String a : allowed) if (a.equalsIgnoreCase(value.trim())) return a;
        }
        return fallback;
    }
}
