package com.softinter.sicapi.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.security.concurrent.DelegatingSecurityContextExecutorService;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.dto.request.AiProjectPipelineRequest;
import com.softinter.sicapi.dto.request.MilestoneRequest;
import com.softinter.sicapi.dto.request.PmDesignReviewRequest;
import com.softinter.sicapi.dto.request.PmDiagramTabRequest;
import com.softinter.sicapi.dto.request.PmMaRenewalRequest;
import com.softinter.sicapi.dto.request.PmMaTicketRequest;
import com.softinter.sicapi.dto.request.PhaseRequest;
import com.softinter.sicapi.dto.request.PmCustomerContractRequest;
import com.softinter.sicapi.dto.request.PmCustomerProjectRequest;
import com.softinter.sicapi.dto.request.PmDeliveryRequest;
import com.softinter.sicapi.dto.request.PmRequirementRequest;
import com.softinter.sicapi.dto.request.PmSpecificationRequest;
import com.softinter.sicapi.dto.request.PmTestCaseRequest;
import com.softinter.sicapi.dto.request.PmTestScenarioRequest;
import com.softinter.sicapi.dto.request.PmUserManualRequest;
import com.softinter.sicapi.dto.request.PmUserManualSectionRequest;
import com.softinter.sicapi.dto.request.TaskRequest;
import com.softinter.sicapi.dto.request.WorkPackageRequest;
import com.softinter.sicapi.dto.response.AiPipelineJobResponse;
import com.softinter.sicapi.dto.response.MilestoneResponse;
import com.softinter.sicapi.dto.response.PhaseResponse;
import com.softinter.sicapi.dto.response.PmCustomerProjectResponse;
import com.softinter.sicapi.dto.response.PmRequirementResponse;
import com.softinter.sicapi.dto.response.TaskResponse;
import com.softinter.sicapi.dto.response.WorkPackageResponse;
import com.softinter.sicapi.dto.response.PmDiagramTabResponse;
import com.softinter.sicapi.entity.enums.MaTicketSeverity;
import com.softinter.sicapi.entity.enums.MaTicketType;
import com.softinter.sicapi.util.DrawioXmlBuilder;
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.pm.PmCustomer;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.service.MilestoneService;
import com.softinter.sicapi.service.PhaseService;
import com.softinter.sicapi.service.PmAiProviderService;
import com.softinter.sicapi.service.PmCustomerContractService;
import com.softinter.sicapi.service.PmCustomerProjectService;
import com.softinter.sicapi.service.PmDesignReviewService;
import com.softinter.sicapi.service.PmDiagramTabService;
import com.softinter.sicapi.service.PmMaRenewalService;
import com.softinter.sicapi.service.PmMaTicketService;
import com.softinter.sicapi.service.TraceLinkService;
import com.softinter.sicapi.service.PmDeliveryService;
import com.softinter.sicapi.service.PmRequirementService;
import com.softinter.sicapi.service.PmSpecificationService;
import com.softinter.sicapi.service.PmTestCaseService;
import com.softinter.sicapi.service.PmTestScenarioService;
import com.softinter.sicapi.service.PmUserManualService;
import com.softinter.sicapi.service.TaskService;
import com.softinter.sicapi.service.WorkPackageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * AI Full-Project Generator แบบทำงานเบื้องหลัง: แตกเป็นขั้นตามลำดับ SDLC เรียก AI ทีละขั้น (ส่งผลขั้นก่อนหน้าเป็นบริบท)
 * แล้วบันทึกผ่าน service เดิมของแต่ละ module (ได้รหัส เวอร์ชัน trace link และ audit เหมือนสร้างเองในหน้าจอ)
 * เก็บสถานะงานไว้ใน memory (หายเมื่อ restart) ให้หน้าเว็บ poll ความคืบหน้า
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiProjectPipelineJobService {

    private final PmAiProviderService aiProvider;
    private final PmCustomerRepository customerRepository;
    private final PmCustomerProjectService projectService;
    private final PmCustomerContractService contractService;
    private final PhaseService phaseService;
    private final MilestoneService milestoneService;
    private final WorkPackageService workPackageService;
    private final PmRequirementService requirementService;
    private final PmSpecificationService specificationService;
    private final TaskService taskService;
    private final PmTestScenarioService scenarioService;
    private final PmTestCaseService testCaseService;
    private final PmDeliveryService deliveryService;
    private final PmUserManualService manualService;
    private final PmDiagramTabService diagramTabService;
    private final PmDesignReviewService designReviewService;
    private final PmMaTicketService maTicketService;
    private final PmMaRenewalService maRenewalService;
    private final TraceLinkService traceLinkService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<UUID, Job> jobs = new ConcurrentHashMap<>();
    private final ExecutorService executor = new DelegatingSecurityContextExecutorService(Executors.newFixedThreadPool(2));

    private static final Pattern JSON_PATTERN = Pattern.compile("```json\\s*([\\s\\S]*?)```");
    private static final long JOB_TTL_MS = 2 * 60 * 60 * 1000L;
    private static final int STATE_ADDED = EntityState.ADDED.ordinal();

    private static final Set<String> REQ_TYPES = Set.of("FUNCTIONAL", "NON_FUNCTIONAL", "BUSINESS_RULE", "REPORT", "INTEGRATION", "SECURITY", "DATA", "UI");
    private static final Set<String> PRIORITIES = Set.of("LOW", "MEDIUM", "HIGH", "CRITICAL");
    private static final Set<String> SPEC_TYPES = Set.of("UI Specification", "API Specification", "Business Rule Specification",
            "Report Specification", "Data Specification", "Integration Specification", "Permission Specification");
    private static final Set<String> CONTRACT_TYPES = Set.of("Development Contract", "Maintenance Contract", "Support Contract",
            "Change Request Contract", "Extension Contract");
    private static final Set<String> DELIVERY_TYPES = Set.of("FINAL", "PARTIAL", "MILESTONE");
    private static final Set<String> MANUAL_TYPES = Set.of("USER", "ADMIN", "INSTALLATION", "OPERATION", "TROUBLESHOOT");

    // ===================== job model =====================

    private static class StepState {
        final String key;
        final String label;
        volatile String status = "PENDING";
        volatile int count;
        volatile String message;

        StepState(String key, String label) {
            this.key = key;
            this.label = label;
        }
    }

    private static class Job {
        final UUID id = UUID.randomUUID();
        final long createdAt = System.currentTimeMillis();
        final List<StepState> steps = new ArrayList<>();
        final Map<String, Integer> counts = new ConcurrentHashMap<>();
        volatile String status = "RUNNING";
        volatile UUID projectId;
        volatile String projectCode;
        volatile String projectName;
        volatile String message;
    }

    private record Ref(UUID id, String name) {
    }

    private static class Ctx {
        Job job;
        AiProjectPipelineRequest req;
        UUID businessId;
        String userId;
        UUID projectId;
        String projectName;
        String projectDescription;
        UUID customerId;
        UUID contractId;
        String contractValueText;
        LocalDate startDate;
        int weeks;
        final List<Ref> phases = new ArrayList<>();
        final List<Ref> milestones = new ArrayList<>();
        final List<Ref> workPackages = new ArrayList<>();
        final List<Ref> requirements = new ArrayList<>();
        final List<Ref> specs = new ArrayList<>();
        final List<Ref> tasks = new ArrayList<>();
        final List<Ref> deliveries = new ArrayList<>();
        final List<Ref> diagrams = new ArrayList<>();
    }

    // ===================== public API =====================

    public UUID start(AiProjectPipelineRequest request, UUID businessId, String userId) {
        purgeOldJobs();
        Job job = new Job();
        job.steps.add(new StepState("PROJECT", "สร้างโครงการ"));
        if (on(request.getIncludeContract())) job.steps.add(new StepState("CONTRACT", "สัญญา"));
        if (on(request.getIncludeGanttPhases())) job.steps.add(new StepState("WBS", "Phase / Milestone / Work Package"));
        if (on(request.getIncludeRequirements())) job.steps.add(new StepState("REQUIREMENT", "Requirement"));
        if (on(request.getIncludeDiagrams())) job.steps.add(new StepState("DIAGRAM", "Diagram (DFD / ER / Flowchart / Use Case)"));
        if (on(request.getIncludeSpecifications())) job.steps.add(new StepState("SPECIFICATION", "Specification"));
        if (on(request.getIncludeDesignReviews())) job.steps.add(new StepState("DESIGN_REVIEW", "Design Review"));
        if (on(request.getIncludeTasks())) job.steps.add(new StepState("TASK", "Task"));
        if (on(request.getIncludeTests())) job.steps.add(new StepState("TEST", "Test Scenario / Test Case"));
        if (on(request.getIncludeDelivery())) job.steps.add(new StepState("DELIVERY", "การส่งมอบ (Delivery)"));
        if (on(request.getIncludeManuals())) job.steps.add(new StepState("MANUAL", "คู่มือการใช้งาน"));
        if (on(request.getIncludeInvoices())) job.steps.add(new StepState("INVOICE", "ใบแจ้งหนี้ (ร่าง)"));
        if (on(request.getIncludeMa())) job.steps.add(new StepState("MA", "MA Ticket / ต่ออายุ MA"));
        jobs.put(job.id, job);

        executor.submit(() -> run(job, request, businessId, userId));
        return job.id;
    }

    public AiPipelineJobResponse get(UUID jobId) {
        Job job = jobs.get(jobId);
        if (job == null) return null;
        List<AiPipelineJobResponse.Step> steps = new ArrayList<>();
        for (StepState s : job.steps) {
            steps.add(AiPipelineJobResponse.Step.builder().key(s.key).label(s.label).status(s.status).count(s.count).message(s.message).build());
        }
        return AiPipelineJobResponse.builder()
                .jobId(job.id).status(job.status).finished(!"RUNNING".equals(job.status))
                .projectId(job.projectId).projectCode(job.projectCode).projectName(job.projectName)
                .steps(steps).createdCounts(new LinkedHashMap<>(job.counts)).message(job.message)
                .build();
    }

    // ===================== orchestration =====================

    private void run(Job job, AiProjectPipelineRequest request, UUID businessId, String userId) {
        BusinessContextHolder.setBusinessId(businessId);
        Ctx c = new Ctx();
        c.job = job;
        c.req = request;
        c.businessId = businessId;
        c.userId = userId;
        c.startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        c.weeks = request.getDurationWeeks() != null && request.getDurationWeeks() > 0 ? request.getDurationWeeks() : 12;

        boolean anyFailed = false;
        try {
            for (StepState step : job.steps) {
                step.status = "RUNNING";
                try {
                    switch (step.key) {
                        case "PROJECT" -> stepProject(c, step);
                        case "CONTRACT" -> stepContract(c, step);
                        case "WBS" -> stepWbs(c, step);
                        case "REQUIREMENT" -> stepRequirements(c, step);
                        case "DIAGRAM" -> stepDiagrams(c, step);
                        case "SPECIFICATION" -> stepSpecifications(c, step);
                        case "DESIGN_REVIEW" -> stepDesignReviews(c, step);
                        case "TASK" -> stepTasks(c, step);
                        case "TEST" -> stepTests(c, step);
                        case "DELIVERY" -> stepDeliveries(c, step);
                        case "MANUAL" -> stepManuals(c, step);
                        case "INVOICE" -> stepInvoices(c, step);
                        case "MA" -> stepMa(c, step);
                        default -> step.status = "SKIPPED";
                    }
                    if ("RUNNING".equals(step.status)) step.status = "DONE";
                    job.counts.put(step.key.toLowerCase(), step.count);
                } catch (Exception e) {
                    log.error("AI pipeline step {} failed", step.key, e);
                    step.status = "FAILED";
                    step.message = e.getMessage();
                    anyFailed = true;
                    if ("PROJECT".equals(step.key)) {
                        markRemainingSkipped(job);
                        job.status = "FAILED";
                        job.message = "สร้างโครงการไม่สำเร็จ: " + e.getMessage();
                        return;
                    }
                }
            }
            job.status = anyFailed ? "COMPLETED_WITH_ERRORS" : "COMPLETED";
            job.message = anyFailed ? "สร้างเสร็จบางส่วน มีบางขั้นตอนไม่สำเร็จ ตรวจสอบรายละเอียดในแต่ละขั้น" : "สร้างโครงการและโมดูลทั้งหมดสำเร็จ พร้อมให้ตรวจสอบ";
        } finally {
            BusinessContextHolder.clear();
        }
    }

    private void markRemainingSkipped(Job job) {
        for (StepState s : job.steps) {
            if ("PENDING".equals(s.status)) s.status = "SKIPPED";
        }
    }

    // ===================== steps =====================

    private void stepProject(Ctx c, StepState step) {
        JsonNode root = ask(c, """
                You are a Lead Enterprise Software Architect & Project Director.
                Create the project charter for the request. Fill EVERY field.
                Respond ONLY with valid JSON in a ```json block, in the same language as the user's request:
                { "projectName": "professional title", "description": "plain text charter (objectives, scope, deliverables), max 1500 characters",
                  "estimatedDurationWeeks": 12, "budgetManday": 120 }
                """, "รายละเอียดโครงการ: " + firstNonBlank(c.req.getPrompt(), c.req.getProjectName())
                + (c.req.getProjectName() != null && !c.req.getProjectName().isBlank() ? "\nชื่อโครงการที่ผู้ใช้กำหนด: " + c.req.getProjectName() : "")
                + "\nระยะเวลาเป้าหมาย: " + c.weeks + " สัปดาห์", true);

        String name = firstNonBlank(c.req.getProjectName(), txt(root, "projectName"), "โครงการใหม่ (AI Generated)");
        String desc = cut(firstNonBlank(txt(root, "description"), c.req.getPrompt()), 2000);
        int weeks = root != null && root.path("estimatedDurationWeeks").asInt(0) > 0 && c.req.getDurationWeeks() == null
                ? root.path("estimatedDurationWeeks").asInt() : c.weeks;
        c.weeks = weeks;

        UUID customerId = c.req.getCustomerId();
        if (customerId == null) {
            List<PmCustomer> customers = customerRepository.findByBusinessIdAndIsActiveTrue(c.businessId);
            if (!customers.isEmpty()) customerId = customers.get(0).getId();
        }
        if (customerId == null) {
            throw new IllegalStateException("ไม่พบลูกค้าในระบบ กรุณาสร้างลูกค้าอย่างน้อย 1 ราย ก่อนใช้ AI Full-Project Generator");
        }
        c.customerId = customerId;

        PmCustomerProjectRequest pr = new PmCustomerProjectRequest();
        pr.setCustomerId(customerId);
        pr.setProjectCode("PRJ-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + String.format("%03d", ThreadLocalRandom.current().nextInt(1000)));
        pr.setProjectName(cut(name, 255));
        pr.setDescription(desc);
        pr.setStartDate(c.startDate);
        pr.setPlannedEndDate(c.startDate.plusWeeks(c.weeks));
        pr.setBudgetManday(root != null && root.path("budgetManday").asInt(0) > 0 ? root.path("budgetManday").asInt() : c.weeks * 10);
        pr.setStatus("Planning");
        pr.setPriority("Medium");
        pr.setIsActive(true);
        PmCustomerProjectResponse saved = projectService.create(c.businessId, pr);

        c.projectId = saved.getId();
        c.projectName = saved.getProjectName();
        c.projectDescription = desc;
        c.job.projectId = saved.getId();
        c.job.projectCode = saved.getProjectCode();
        c.job.projectName = saved.getProjectName();
        step.count = 1;
    }

    private void stepContract(Ctx c, StepState step) {
        JsonNode root = ask(c, """
                You are a contract specialist for enterprise software projects. Fill EVERY field.
                Respond ONLY with valid JSON in a ```json block, same language as the project:
                { "contractType": "Development Contract | Maintenance Contract | Support Contract | Change Request Contract | Extension Contract",
                  "contractValue": 1500000,
                  "paymentTerms": "payment schedule in installments, plain text",
                  "scopeSummary": "HTML scope summary using <h3>,<p>,<ul>,<li>" }
                """, projectContext(c), false);

        PmCustomerContractRequest cr = new PmCustomerContractRequest();
        cr.setContractNo("CT-" + LocalDate.now().getYear() + "-" + String.format("%03d", ThreadLocalRandom.current().nextInt(1000)));
        String type = txt(root, "contractType");
        cr.setContractType(CONTRACT_TYPES.contains(type) ? type : "Development Contract");
        cr.setCustomerId(c.customerId);
        cr.setProjectId(c.projectId);
        cr.setStartDate(c.startDate);
        cr.setEndDate(c.startDate.plusWeeks(c.weeks));
        cr.setContractValue(root != null && root.path("contractValue").isNumber() ? root.path("contractValue").decimalValue() : BigDecimal.ZERO);
        cr.setPaymentTerms(txt(root, "paymentTerms"));
        cr.setScopeSummary(txt(root, "scopeSummary"));
        cr.setSignStatus("Draft");
        cr.setIsActive(true);
        c.contractId = contractService.saveContract(c.businessId, cr);
        c.contractValueText = cr.getContractValue() + " บาท, " + cr.getContractType();
        step.count = 1;
    }

    private void stepWbs(Ctx c, StepState step) {
        JsonNode root = ask(c, """
                You are a Senior Project Manager. Build the work breakdown structure: Phase -> Milestone -> Work Package.
                Limits: 3-5 phases, max 2 milestones per phase, max 2 work packages per milestone. Fill EVERY field.
                Weeks are 1-based within the project duration. Respond ONLY with valid JSON in a ```json block, same language as the project:
                { "phases": [ { "phaseName": "...", "description": "...", "weekStart": 1, "weekEnd": 3, "color": "#3B82F6",
                    "milestones": [ { "milestoneName": "...", "description": "...", "weekDue": 3,
                        "workPackages": [ { "packageName": "...", "description": "...", "weekStart": 1, "weekEnd": 2 } ] } ] } ] }
                """, projectContext(c) + "\nระยะเวลา: " + c.weeks + " สัปดาห์", false);

        int total = 0;
        for (JsonNode ph : arr(root, "phases")) {
            PhaseRequest pq = new PhaseRequest();
            pq.setProjectId(c.projectId);
            pq.setPhaseName(cut(txt(ph, "phaseName"), 255));
            pq.setDescription(txt(ph, "description"));
            pq.setStartDate(weekStart(c, ph.path("weekStart").asInt(1)));
            pq.setEndDate(weekEnd(c, ph.path("weekEnd").asInt(c.weeks)));
            pq.setColor(firstNonBlank(txt(ph, "color"), "#3B82F6"));
            PhaseResponse phase = phaseService.createPhase(pq);
            c.phases.add(new Ref(phase.getId(), pq.getPhaseName()));
            total++;

            for (JsonNode ms : arr(ph, "milestones")) {
                MilestoneRequest mq = new MilestoneRequest();
                mq.setPhaseId(phase.getId());
                mq.setMilestoneName(cut(txt(ms, "milestoneName"), 255));
                mq.setDescription(txt(ms, "description"));
                mq.setDueDate(weekEnd(c, ms.path("weekDue").asInt(pq.getEndDate() != null ? c.weeks : 1)));
                mq.setColor(pq.getColor());
                MilestoneResponse milestone = milestoneService.createMilestone(mq);
                c.milestones.add(new Ref(milestone.getId(), mq.getMilestoneName()));
                total++;

                for (JsonNode wp : arr(ms, "workPackages")) {
                    WorkPackageRequest wq = new WorkPackageRequest();
                    wq.setMilestoneId(milestone.getId());
                    wq.setPackageName(cut(txt(wp, "packageName"), 255));
                    wq.setDescription(txt(wp, "description"));
                    wq.setStartDate(weekStart(c, wp.path("weekStart").asInt(1)));
                    wq.setEndDate(weekEnd(c, wp.path("weekEnd").asInt(2)));
                    wq.setColor(pq.getColor());
                    WorkPackageResponse saved = workPackageService.createWorkPackage(wq);
                    c.workPackages.add(new Ref(saved.getId(), wq.getPackageName()));
                    total++;
                }
            }
        }
        step.count = total;
        if (c.phases.isEmpty()) step.message = "AI ไม่สามารถสร้าง WBS ได้";
    }

    private void stepRequirements(Ctx c, StepState step) {
        JsonNode root = ask(c, """
                You are a Principal Business Analyst. List the software requirements of the project (max 8). Fill EVERY field.
                requirementType is one of: FUNCTIONAL | NON_FUNCTIONAL | BUSINESS_RULE | REPORT | INTEGRATION | SECURITY | DATA | UI.
                priority is one of: LOW | MEDIUM | HIGH | CRITICAL.
                Respond ONLY with valid JSON in a ```json block, same language as the project:
                { "requirements": [ { "title": "...", "description": "HTML (<p>,<ul>,<li>)", "requirementType": "FUNCTIONAL", "priority": "HIGH",
                    "businessValue": "HTML", "acceptanceCriteria": "HTML" } ] }
                """, projectContext(c), true);

        int idx = 1;
        for (JsonNode n : arr(root, "requirements")) {
            PmRequirementRequest rq = new PmRequirementRequest();
            rq.setProjectId(c.projectId);
            rq.setRequirementCode(String.format("REQ-%03d", idx++));
            rq.setTitle(cut(txt(n, "title"), 255));
            rq.setDescription(txt(n, "description"));
            rq.setRequirementType(pick(txt(n, "requirementType"), REQ_TYPES, "FUNCTIONAL"));
            rq.setPriority(pick(txt(n, "priority"), PRIORITIES, "MEDIUM"));
            rq.setBusinessValue(txt(n, "businessValue"));
            rq.setAcceptanceCriteria(txt(n, "acceptanceCriteria"));
            rq.setVersion("v1.0.0");
            rq.setStatus("DRAFT");
            rq.setIsActive(true);
            rq.setState(STATE_ADDED);
            PmRequirementResponse saved = requirementService.save(rq, c.businessId, c.userId);
            c.requirements.add(new Ref(saved.getId(), rq.getTitle()));
        }
        step.count = c.requirements.size();
        if (c.requirements.isEmpty()) step.message = "AI ไม่สามารถสร้าง Requirement ได้";
    }

    private void stepSpecifications(Ctx c, StepState step) {
        JsonNode root = ask(c, """
                You are a Lead System Analyst. Write a specification for the requirements (max 8, each linked to one requirement by its number). Fill EVERY field.
                specificationType is one of: UI Specification | API Specification | Business Rule Specification | Report Specification | Data Specification | Integration Specification | Permission Specification.
                priority is one of: LOW | MEDIUM | HIGH | CRITICAL.
                Respond ONLY with valid JSON in a ```json block, same language as the project:
                { "specifications": [ { "requirementRef": 1, "title": "...", "specificationType": "UI Specification", "priority": "HIGH",
                    "estimatedManday": 5, "description": "HTML (<h3>,<p>,<ul>,<li>)" } ] }
                """, projectContext(c) + "\n\nRequirements:\n" + numbered(c.requirements), false);

        int idx = 1;
        for (JsonNode n : arr(root, "specifications")) {
            PmSpecificationRequest sq = new PmSpecificationRequest();
            sq.setProjectId(c.projectId);
            sq.setSpecificationCode(String.format("SPEC-%03d", idx++));
            sq.setTitle(cut(txt(n, "title"), 255));
            sq.setSpecificationType(pick(txt(n, "specificationType"), SPEC_TYPES, "UI Specification"));
            sq.setPriority(pick(txt(n, "priority"), PRIORITIES, "MEDIUM"));
            sq.setEstimatedManday(n.path("estimatedManday").asInt(3));
            sq.setDescription(firstNonBlank(txt(n, "description"), "<p>" + sq.getTitle() + "</p>"));
            sq.setVersion("v1.0.0");
            sq.setStatus("DRAFT");
            sq.setIsActive(true);
            sq.setState(STATE_ADDED);
            Ref req = refAt(c.requirements, n.path("requirementRef").asInt(0), idx - 2);
            if (req != null) sq.setRequirementId(req.id());
            UUID id = specificationService.save(sq, c.businessId, c.userId);
            c.specs.add(new Ref(id, sq.getTitle()));
        }
        step.count = c.specs.size();
        if (c.specs.isEmpty()) step.message = "AI ไม่สามารถสร้าง Specification ได้";
    }

    private void stepTasks(Ctx c, StepState step) {
        if (c.workPackages.isEmpty()) {
            throw new IllegalStateException("ไม่มี Work Package ให้ผูก Task (ขั้น WBS ไม่สำเร็จหรือถูกปิดไว้)");
        }
        JsonNode root = ask(c, """
                You are a Delivery Manager. Break the work into implementation tasks (max 12), each linked to one work package and, if relevant, one specification by number.
                Fill EVERY field. priority is one of: Critical | High | Medium | Low. Weeks are 1-based within the project duration.
                Respond ONLY with valid JSON in a ```json block, same language as the project:
                { "tasks": [ { "workPackageRef": 1, "specificationRef": 1, "taskName": "...", "description": "...", "estimateManday": 3,
                    "weekStart": 1, "durationDays": 5, "priority": "High" } ] }
                """, projectContext(c) + "\n\nWork Packages:\n" + numbered(c.workPackages) + "\n\nSpecifications:\n" + numbered(c.specs), false);

        int idx = 1;
        for (JsonNode n : arr(root, "tasks")) {
            TaskRequest tq = new TaskRequest();
            Ref wp = refAt(c.workPackages, n.path("workPackageRef").asInt(0), idx - 1);
            tq.setWorkPackageId(wp.id());
            Ref spec = refAt(c.specs, n.path("specificationRef").asInt(0), -1);
            if (spec != null) tq.setSpecificationId(spec.id());
            tq.setTaskCode(String.format("TSK-%03d", idx++));
            tq.setTaskName(cut(txt(n, "taskName"), 255));
            tq.setDescription(txt(n, "description"));
            LocalDate start = weekStart(c, n.path("weekStart").asInt(1));
            tq.setStartDate(start);
            tq.setEndDate(start.plusDays(Math.max(1, n.path("durationDays").asInt(5))));
            tq.setEstimateManday(n.path("estimateManday").asInt(3));
            tq.setPriority(pickIgnoreCase(txt(n, "priority"), List.of("Critical", "High", "Medium", "Low"), "Medium"));
            TaskResponse saved = taskService.createTask(tq);
            c.tasks.add(new Ref(saved.getId(), tq.getTaskName()));
        }
        step.count = c.tasks.size();
        if (c.tasks.isEmpty()) step.message = "AI ไม่สามารถสร้าง Task ได้";
    }

    private void stepTests(Ctx c, StepState step) {
        if (c.tasks.isEmpty()) {
            throw new IllegalStateException("ไม่มี Task ให้ผูก Test Scenario (ขั้น Task ไม่สำเร็จหรือถูกปิดไว้)");
        }
        JsonNode root = ask(c, """
                You are a Lead QA Engineer. Design test scenarios (max 6), each linked to one task by number, with 2-3 test cases each. Fill EVERY field.
                priority is one of: LOW | MEDIUM | HIGH | CRITICAL. testType is one of: SIT | UAT.
                Respond ONLY with valid JSON in a ```json block, same language as the project:
                { "scenarios": [ { "taskRef": 1, "scenarioName": "...", "description": "HTML", "priority": "HIGH", "testType": "SIT",
                    "cases": [ { "title": "...", "testStep": "<ol><li>...</li></ol>", "expectedResult": "<p>...</p>", "priority": "MEDIUM" } ] } ] }
                """, projectContext(c) + "\n\nTasks:\n" + numbered(c.tasks), false);

        int sIdx = 1;
        int cIdx = 1;
        int cases = 0;
        for (JsonNode sn : arr(root, "scenarios")) {
            Ref task = refAt(c.tasks, sn.path("taskRef").asInt(0), sIdx - 1);
            String testType = pick(txt(sn, "testType"), Set.of("SIT", "UAT"), "SIT");
            PmTestScenarioRequest sq = new PmTestScenarioRequest();
            sq.setProjectId(c.projectId);
            sq.setTaskId(task.id());
            sq.setScenarioCode(String.format("SC-%03d", sIdx++));
            sq.setScenarioName(cut(txt(sn, "scenarioName"), 255));
            sq.setDescription(txt(sn, "description"));
            sq.setPriority(pick(txt(sn, "priority"), PRIORITIES, "MEDIUM"));
            sq.setTestType(testType);
            sq.setState(STATE_ADDED);
            UUID scenarioId = scenarioService.save(sq, c.businessId, c.userId);

            for (JsonNode cn : arr(sn, "cases")) {
                PmTestCaseRequest cq = new PmTestCaseRequest();
                cq.setProjectId(c.projectId);
                cq.setScenarioId(scenarioId);
                cq.setScenarioName(sq.getScenarioName());
                cq.setTaskId(task.id());
                cq.setTestCaseCode(String.format("TC-%03d", cIdx++));
                cq.setTitle(cut(txt(cn, "title"), 255));
                cq.setPriority(pick(txt(cn, "priority"), PRIORITIES, "MEDIUM"));
                cq.setTestStep(firstNonBlank(txt(cn, "testStep"), "<p>-</p>"));
                cq.setExpectedResult(firstNonBlank(txt(cn, "expectedResult"), "<p>-</p>"));
                cq.setTestStatus("Pending");
                cq.setTestType(testType);
                cq.setState(STATE_ADDED);
                testCaseService.save(cq, c.businessId, c.userId);
                cases++;
            }
        }
        step.count = (sIdx - 1) + cases;
        step.message = (sIdx - 1) + " scenario, " + cases + " test case";
        if (sIdx == 1) step.message = "AI ไม่สามารถสร้าง Test Scenario ได้";
    }

    private void stepDeliveries(Ctx c, StepState step) {
        JsonNode root = ask(c, """
                You are a Delivery Manager. Plan the deliveries (2-4, the last one is FINAL), each optionally tied to a milestone by number. Fill EVERY field.
                deliveryType is one of: FINAL | PARTIAL | MILESTONE.
                Respond ONLY with valid JSON in a ```json block, same language as the project:
                { "deliveries": [ { "milestoneRef": 1, "deliveryTitle": "...", "deliveryType": "PARTIAL", "deliverySummary": "HTML", "releaseNote": "HTML" } ] }
                """, projectContext(c) + "\n\nMilestones:\n" + numbered(c.milestones), false);

        List<JsonNode> items = arr(root, "deliveries");
        int n = Math.max(1, items.size());
        int idx = 1;
        for (JsonNode d : items) {
            PmDeliveryRequest dq = new PmDeliveryRequest();
            dq.setProjectId(c.projectId);
            dq.setContractId(c.contractId);
            dq.setDeliveryCode(String.format("DEL-%03d", idx));
            dq.setDeliveryTitle(cut(txt(d, "deliveryTitle"), 255));
            dq.setDeliveryType(pick(txt(d, "deliveryType"), DELIVERY_TYPES, idx == n ? "FINAL" : "PARTIAL"));
            Ref ms = refAt(c.milestones, d.path("milestoneRef").asInt(0), -1);
            if (ms != null) dq.setMilestoneId(ms.id());
            dq.setDeliveryDate(c.startDate.plusWeeks(Math.max(1, (long) c.weeks * idx / n)));
            dq.setDeliveryVersion("1.0." + (idx - 1));
            dq.setDeliverySummary(txt(d, "deliverySummary"));
            dq.setReleaseNote(txt(d, "releaseNote"));
            dq.setStatus("DRAFT");
            dq.setState(STATE_ADDED);
            UUID id = deliveryService.save(dq, c.businessId, c.userId);
            c.deliveries.add(new Ref(id, dq.getDeliveryTitle()));
            idx++;
        }
        step.count = c.deliveries.size();
        if (c.deliveries.isEmpty()) step.message = "AI ไม่สามารถวางแผนการส่งมอบได้";
    }

    private void stepManuals(Ctx c, StepState step) {
        JsonNode root = ask(c, """
                You are a Technical Writer. Write user manuals for the project (max 3), each with 3-4 sections. Fill EVERY field.
                manualType is one of: USER | ADMIN | INSTALLATION | OPERATION | TROUBLESHOOT.
                Respond ONLY with valid JSON in a ```json block, same language as the project:
                { "manuals": [ { "manualTitle": "...", "manualType": "USER", "sections": [ { "sectionTitle": "...", "content": "HTML" } ] } ] }
                """, projectContext(c) + "\n\nSpecifications:\n" + numbered(c.specs), false);

        UUID lastDelivery = c.deliveries.isEmpty() ? null : c.deliveries.get(c.deliveries.size() - 1).id();
        int idx = 1;
        int count = 0;
        for (JsonNode m : arr(root, "manuals")) {
            PmUserManualRequest mq = new PmUserManualRequest();
            mq.setProjectId(c.projectId);
            mq.setDeliveryId(lastDelivery);
            mq.setManualCode(String.format("MAN-%03d", idx++));
            mq.setManualTitle(cut(txt(m, "manualTitle"), 255));
            mq.setManualType(pick(txt(m, "manualType"), MANUAL_TYPES, "USER"));
            mq.setStatus("DRAFT");
            mq.setState(STATE_ADDED);
            List<PmUserManualSectionRequest> sections = new ArrayList<>();
            int sIdx = 1;
            for (JsonNode s : arr(m, "sections")) {
                PmUserManualSectionRequest sq = new PmUserManualSectionRequest();
                sq.setSectionCode("SEC-" + sIdx);
                sq.setSectionTitle(cut(txt(s, "sectionTitle"), 255));
                sq.setContent(txt(s, "content"));
                sq.setSortOrder(sIdx++);
                sq.setState(STATE_ADDED);
                sections.add(sq);
            }
            mq.setSections(sections);
            manualService.save(mq, c.businessId, c.userId);
            count++;
        }
        step.count = count;
        if (count == 0) step.message = "AI ไม่สามารถสร้างคู่มือได้";
    }

    private void stepInvoices(Ctx c, StepState step) {
        if (c.deliveries.isEmpty()) {
            throw new IllegalStateException("ไม่มีการส่งมอบให้สร้างใบแจ้งหนี้ (ขั้น Delivery ไม่สำเร็จหรือถูกปิดไว้)");
        }
        int count = 0;
        StringBuilder errors = new StringBuilder();
        for (Ref d : c.deliveries) {
            try {
                deliveryService.createInvoiceFromDelivery(d.id(), c.businessId, c.userId);
                count++;
            } catch (Exception e) {
                errors.append(d.name()).append(": ").append(e.getMessage()).append("; ");
            }
        }
        step.count = count;
        if (errors.length() > 0) step.message = "สร้างบางรายการไม่ได้: " + errors;
    }


    private void stepDiagrams(Ctx c, StepState step) {
        JsonNode root = ask(c, """
                You are a System Analyst. Design the analysis/design diagrams of the project (max 4): one DFD, one ER, one Flowchart of the main business process, optionally one Use Case.
                Each diagram is linked to one requirement by number. Keep every diagram small (max 12 nodes / 8 entities). Fill EVERY field.
                Respond ONLY with valid JSON in a ```json block, same language as the project:
                { "diagrams": [
                  { "name": "...", "type": "DFD", "requirementRef": 1,
                    "nodes": [ { "id": "n1", "label": "...", "kind": "EXTERNAL | PROCESS | STORE" } ],
                    "edges": [ { "from": "n1", "to": "n2", "label": "data flow" } ] },
                  { "name": "...", "type": "ER", "requirementRef": 1,
                    "entities": [ { "name": "Customer", "attributes": [ "id (PK)", "name", "email" ] } ],
                    "relations": [ { "from": "Customer", "to": "Order", "label": "places", "cardinality": "1:N" } ] },
                  { "name": "...", "type": "Flowchart", "requirementRef": 1,
                    "nodes": [ { "id": "n1", "label": "...", "kind": "START | TASK | DECISION | END" } ],
                    "edges": [ { "from": "n1", "to": "n2", "label": "" } ] },
                  { "name": "...", "type": "Use Case", "requirementRef": 1,
                    "nodes": [ { "id": "n1", "label": "...", "kind": "ACTOR | USECASE" } ],
                    "edges": [ { "from": "n1", "to": "n2", "label": "" } ] } ] }
                """, projectContext(c) + "\n\nRequirements:\n" + numbered(c.requirements), false);

        int made = 0;
        for (JsonNode d : arr(root, "diagrams")) {
            String type = normalizeDiagramType(txt(d, "type"));
            String xml;
            if ("ER".equals(type)) {
                List<DrawioXmlBuilder.Entity> entities = new ArrayList<>();
                for (JsonNode e : arr(d, "entities")) {
                    List<String> attrs = new ArrayList<>();
                    for (JsonNode a : arr(e, "attributes")) attrs.add(a.asText(""));
                    entities.add(new DrawioXmlBuilder.Entity(txt(e, "name"), attrs));
                }
                List<DrawioXmlBuilder.Relation> rels = new ArrayList<>();
                for (JsonNode r : arr(d, "relations")) {
                    rels.add(new DrawioXmlBuilder.Relation(txt(r, "from"), txt(r, "to"), txt(r, "label"), txt(r, "cardinality")));
                }
                if (entities.isEmpty()) continue;
                xml = DrawioXmlBuilder.er(entities, rels);
            } else {
                List<DrawioXmlBuilder.Node> nodes = new ArrayList<>();
                for (JsonNode n : arr(d, "nodes")) nodes.add(new DrawioXmlBuilder.Node(txt(n, "id"), txt(n, "label"), txt(n, "kind")));
                List<DrawioXmlBuilder.Edge> edges = new ArrayList<>();
                for (JsonNode e : arr(d, "edges")) edges.add(new DrawioXmlBuilder.Edge(txt(e, "from"), txt(e, "to"), txt(e, "label")));
                if (nodes.isEmpty()) continue;
                xml = DrawioXmlBuilder.graph(nodes, edges);
            }

            PmDiagramTabRequest dq = new PmDiagramTabRequest();
            dq.setProjectId(c.projectId);
            dq.setName(cut(firstNonBlank(txt(d, "name"), type + " " + (made + 1)), 255));
            dq.setDiagramType(type);
            Ref req = refAt(c.requirements, d.path("requirementRef").asInt(0), -1);
            if (req != null) dq.setRequirementId(req.id());
            Map<String, Object> graph = new LinkedHashMap<>();
            graph.put("xml", xml);
            dq.setGraphData(graph);
            dq.setIsActive(true);
            PmDiagramTabResponse tab = diagramTabService.createTab(dq);
            c.diagrams.add(new Ref(tab.getId(), dq.getName()));
            made++;
            try {
                traceLinkService.createLinksFromDiagramXml(c.projectId, tab.getId(), type, xml);
            } catch (Exception e) {
                log.warn("AI pipeline: cannot create trace links from diagram xml: {}", e.getMessage());
            }
        }
        step.count = made;
        if (made == 0) step.message = "AI ไม่สามารถสร้าง Diagram ได้";
    }

    private static String normalizeDiagramType(String t) {
        if (t == null) return "Flowchart";
        String u = t.trim().toUpperCase().replace(" ", "").replace("_", "");
        return switch (u) {
            case "DFD" -> "DFD";
            case "ER", "ERD" -> "ER";
            case "USECASE" -> "Use Case";
            default -> "Flowchart";
        };
    }

    private void stepDesignReviews(Ctx c, StepState step) {
        if (c.specs.isEmpty() && c.diagrams.isEmpty()) {
            throw new IllegalStateException("ไม่มี Specification หรือ Diagram ให้ตรวจทาน");
        }
        JsonNode root = ask(c, """
                You are a Design Review Lead. Create design review items (max 4) for the specifications and diagrams. Fill EVERY field.
                targetType is one of: Specification | Diagram. targetRef is the number in the matching list. severity is one of: Low | Medium | High.
                Respond ONLY with valid JSON in a ```json block, same language as the project:
                { "reviews": [ { "targetType": "Specification", "targetRef": 1, "title": "...", "description": "HTML checklist of what to review", "severity": "Medium" } ] }
                """, projectContext(c) + "\n\nSpecifications:\n" + numbered(c.specs) + "\nDiagrams:\n" + numbered(c.diagrams), false);

        int idx = 1;
        int count = 0;
        for (JsonNode r : arr(root, "reviews")) {
            boolean isDiagram = "Diagram".equalsIgnoreCase(txt(r, "targetType"));
            Ref target = refAt(isDiagram ? c.diagrams : c.specs, r.path("targetRef").asInt(0), 0);
            if (target == null) continue;
            PmDesignReviewRequest rq = new PmDesignReviewRequest();
            rq.setProjectId(c.projectId);
            rq.setReviewCode(String.format("DR-%03d", idx++));
            rq.setTitle(cut(txt(r, "title"), 255));
            rq.setDescription(txt(r, "description"));
            rq.setReviewableType(isDiagram ? "Diagram" : "Specification");
            rq.setReviewableId(target.id());
            rq.setSeverity(pickIgnoreCase(txt(r, "severity"), List.of("Low", "Medium", "High"), "Medium"));
            rq.setStatus("Open");
            rq.setIsActive(true);
            designReviewService.save(rq, c.businessId, c.userId);
            count++;
        }
        step.count = count;
        if (count == 0) step.message = "AI ไม่สามารถสร้าง Design Review ได้";
    }

    private void stepMa(Ctx c, StepState step) {
        JsonNode root = ask(c, """
                You are a Maintenance & Support Manager. Anticipate 2-3 realistic post-go-live support tickets for this project and one MA renewal proposal. Fill EVERY field.
                ticketType is one of: BUG_SUPPORT | DATA_ISSUE | USER_SUPPORT | CHANGE_REQUEST. severity is one of: LOW | MEDIUM | HIGH | CRITICAL.
                Respond ONLY with valid JSON in a ```json block, same language as the project:
                { "tickets": [ { "title": "...", "description": "HTML", "ticketType": "USER_SUPPORT", "severity": "MEDIUM" } ],
                  "renewal": { "proposedAmount": 180000, "remark": "..." } }
                """, projectContext(c) + (c.contractValueText != null ? "\nสัญญา: " + c.contractValueText : ""), false);

        int count = 0;
        for (JsonNode t : arr(root, "tickets")) {
            PmMaTicketRequest tq = new PmMaTicketRequest();
            tq.setProjectId(c.projectId);
            tq.setCustomerId(c.customerId);
            tq.setContractId(c.contractId);
            tq.setTitle(cut(txt(t, "title"), 255));
            tq.setDescription(firstNonBlank(txt(t, "description"), tq.getTitle()));
            tq.setTicketType(MaTicketType.valueOf(pick(txt(t, "ticketType"), Set.of("BUG_SUPPORT", "DATA_ISSUE", "USER_SUPPORT", "CHANGE_REQUEST"), "USER_SUPPORT")));
            tq.setSeverity(MaTicketSeverity.valueOf(pick(txt(t, "severity"), Set.of("LOW", "MEDIUM", "HIGH", "CRITICAL"), "MEDIUM")));
            tq.setReportedBy(c.userId);
            tq.setState(STATE_ADDED);
            maTicketService.save(tq, c.businessId, c.userId);
            count++;
        }

        JsonNode renewal = root == null ? null : root.path("renewal");
        if (renewal != null && renewal.isObject() && c.contractId != null) {
            LocalDate end = c.startDate.plusWeeks(c.weeks);
            PmMaRenewalRequest rq = new PmMaRenewalRequest();
            rq.setContractId(c.contractId);
            rq.setCustomerId(c.customerId);
            rq.setProjectId(c.projectId);
            rq.setCurrentEndDate(end);
            rq.setNewStartDate(end.plusDays(1));
            rq.setNewEndDate(end.plusYears(1));
            rq.setProposedAmount(renewal.path("proposedAmount").isNumber() ? renewal.path("proposedAmount").decimalValue() : BigDecimal.ZERO);
            rq.setRemark(txt(renewal, "remark"));
            rq.setState(STATE_ADDED);
            maRenewalService.save(rq, c.businessId, c.userId);
            count++;
        } else if (c.contractId == null) {
            step.message = "ข้ามข้อเสนอต่ออายุ MA เพราะไม่มีสัญญา";
        }
        step.count = count;
        if (count == 0) step.message = "AI ไม่สามารถสร้างข้อมูล MA ได้";
    }

    // ===================== helpers =====================

    private static boolean on(Boolean flag) {
        return flag == null || flag;
    }

    private String projectContext(Ctx c) {
        return "โครงการ: " + c.projectName + "\nรายละเอียด: " + c.projectDescription;
    }

    private JsonNode ask(Ctx c, String systemPrompt, String userPrompt, boolean withAttachments) {
        try {
            String raw = aiProvider.generateRawResponse(userPrompt, systemPrompt, c.req.getModel(),
                    withAttachments ? c.req.getAttachments() : null);
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
            log.warn("AI pipeline: cannot parse AI response: {}", e.getMessage());
            return null;
        }
    }

    private List<JsonNode> arr(JsonNode node, String field) {
        List<JsonNode> out = new ArrayList<>();
        if (node == null) return out;
        JsonNode a = node.path(field);
        if (a.isArray()) a.forEach(out::add);
        return out;
    }

    private String txt(JsonNode n, String field) {
        if (n == null || n.path(field).isMissingNode() || n.path(field).isNull()) return null;
        String v = n.path(field).asText(null);
        return v == null || v.isBlank() ? null : v.trim();
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) return v;
        }
        return null;
    }

    private static String cut(String v, int max) {
        if (v == null) return null;
        return v.length() <= max ? v : v.substring(0, max);
    }

    private static String pick(String value, Set<String> allowed, String fallback) {
        if (value != null) {
            for (String a : allowed) {
                if (a.equalsIgnoreCase(value.trim())) return a;
            }
        }
        return fallback;
    }

    private static String pickIgnoreCase(String value, List<String> allowed, String fallback) {
        return pick(value, Set.copyOf(allowed), fallback);
    }

    private String numbered(List<Ref> refs) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < refs.size(); i++) {
            sb.append(i + 1).append(". ").append(refs.get(i).name()).append("\n");
        }
        return sb.length() == 0 ? "(none)" : sb.toString();
    }

    /** ref เลขลำดับ 1-based จาก AI; ถ้าไม่ระบุ/เกินช่วง ใช้ fallbackIndex (วนตามจำนวน) หรือ null ถ้า fallbackIndex < 0 */
    private Ref refAt(List<Ref> refs, int oneBased, int fallbackIndex) {
        if (refs.isEmpty()) return null;
        if (oneBased >= 1 && oneBased <= refs.size()) return refs.get(oneBased - 1);
        if (fallbackIndex < 0) return null;
        return refs.get(fallbackIndex % refs.size());
    }

    private LocalDate weekStart(Ctx c, int week) {
        return c.startDate.plusWeeks(Math.max(1, Math.min(week, c.weeks)) - 1L);
    }

    private LocalDate weekEnd(Ctx c, int week) {
        return c.startDate.plusWeeks(Math.max(1, Math.min(week, c.weeks)));
    }

    private void purgeOldJobs() {
        long now = System.currentTimeMillis();
        jobs.values().removeIf(j -> now - j.createdAt > JOB_TTL_MS && !"RUNNING".equals(j.status));
    }
}
