package com.softinter.sicapi.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
import com.softinter.sicapi.dto.request.PmMaTicketRequest;
import com.softinter.sicapi.dto.request.PhaseRequest;
import com.softinter.sicapi.dto.request.PmCustomerContractRequest;
import com.softinter.sicapi.dto.request.PmCustomerProjectRequest;
import com.softinter.sicapi.dto.request.PmDeliveryChecklistRequest;
import com.softinter.sicapi.dto.request.PmDeliveryItemRequest;
import com.softinter.sicapi.dto.request.PmDeliveryRequest;
import com.softinter.sicapi.dto.request.PmInvoiceItemRequest;
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
import com.softinter.sicapi.entity.enums.EntityState;
import com.softinter.sicapi.entity.pm.AiPipelineJob;
import com.softinter.sicapi.entity.pm.PmCustomer;
import com.softinter.sicapi.repository.pm.AiPipelineJobRepository;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRepository;
import com.softinter.sicapi.util.LocalizationHelper;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmCustomerRepository;
import com.softinter.sicapi.service.MilestoneService;
import com.softinter.sicapi.service.PhaseService;
import com.softinter.sicapi.service.PmAiProviderService;
import com.softinter.sicapi.service.PmCustomerContractService;
import com.softinter.sicapi.service.PmCustomerProjectService;
import com.softinter.sicapi.service.PmDesignReviewService;
import com.softinter.sicapi.service.PmDiagramTabService;
import com.softinter.sicapi.service.PmMaTicketService;
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
import java.time.Instant;
import jakarta.annotation.PostConstruct;

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
    private final AiPipelineJobRepository jobRepository;
    private final PmCustomerProjectRepository projectRepository;
    private final PmCustomerContractRepository contractRepository;
    private final SuUserBusinessRepository userBusinessRepository;
    private final SuProfileRepository profileRepository;
    private final ThaiCustomerGeneratorHelper thaiCustomerGenerator;

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
        volatile UUID id; // assigned by the DB entity on first persistJob()
        final long createdAt = System.currentTimeMillis();
        final Instant createdDate = Instant.now();
        final List<StepState> steps = new ArrayList<>();
        final Map<String, Integer> counts = new ConcurrentHashMap<>();
        volatile String status = "RUNNING";
        volatile UUID projectId;
        volatile String projectCode;
        volatile String projectName;
        volatile String message;
        volatile String prompt;
        volatile Integer durationWeeks;
        volatile String aiModel;
        volatile UUID businessId;
    }

    private record Ref(UUID id, String name) {
    }

    private record Member(String userId, String name) {
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
        String quotaError;
        final List<Ref> phases = new ArrayList<>();
        final List<Ref> milestones = new ArrayList<>();
        final List<Ref> workPackages = new ArrayList<>();
        final List<Ref> requirements = new ArrayList<>();
        final List<Ref> specs = new ArrayList<>();
        final List<Ref> tasks = new ArrayList<>();
        final List<Ref> deliveries = new ArrayList<>();
        final List<Ref> diagrams = new ArrayList<>();
        final List<Member> members = new ArrayList<>();
        final Map<UUID, String> wpColors = new HashMap<>();
    }

    // ===================== public API =====================

    public UUID start(AiProjectPipelineRequest request, UUID businessId, String userId) {
        purgeOldJobs();
        rejectIfDuplicateRunning(businessId, request.getPrompt());
        Job job = new Job();
        job.businessId = businessId;
        job.prompt = request.getPrompt();
        job.durationWeeks = request.getDurationWeeks();
        job.aiModel = request.getModel();
        job.projectName = request.getProjectName();
        if (request.getCustomerId() == null) {
            job.steps.add(new StepState("CUSTOMER", "ลูกค้า (Customer)"));
        }
        job.steps.add(new StepState("PROJECT", "สร้างโครงการ"));
        if (on(request.getIncludeContract())) job.steps.add(new StepState("CONTRACT", "สัญญา"));
        if (on(request.getIncludeGanttPhases())) job.steps.add(new StepState("WBS", "Phase / Milestone / Work Package"));
        if (on(request.getIncludeRequirements())) job.steps.add(new StepState("REQUIREMENT", "Requirement"));
        if (on(request.getIncludeDiagrams())) job.steps.add(new StepState("DIAGRAM", "Diagram (DFD / ER / Flowchart / Use Case)"));
        if (on(request.getIncludeSpecifications())) job.steps.add(new StepState("SPECIFICATION", "Specification"));
        if (on(request.getIncludeDesignReviews())) job.steps.add(new StepState("DESIGN_REVIEW", "Design Review"));
        if (on(request.getIncludeTasks())) job.steps.add(new StepState("TASK", "Task"));
        if (on(request.getIncludeTests())) job.steps.add(new StepState("TEST", "Test Scenario / Test Case"));
        if (on(request.getIncludeManuals())) job.steps.add(new StepState("MANUAL", "คู่มือการใช้งาน"));
        if (on(request.getIncludeDelivery())) job.steps.add(new StepState("DELIVERY", "การส่งมอบ (Delivery)"));
        if (on(request.getIncludeInvoices())) job.steps.add(new StepState("INVOICE", "ใบแจ้งหนี้ (ร่าง)"));
        if (on(request.getIncludeMa())) job.steps.add(new StepState("MA", "MA Ticket / ต่ออายุ MA"));
        persistJob(job, businessId, userId, request);
        jobs.put(job.id, job);

        executor.submit(() -> run(job, request, businessId, userId));
        return job.id;
    }

    public AiPipelineJobResponse get(UUID jobId) {
        Job job = jobs.get(jobId);
        if (job != null) return toResponse(job);
        return jobRepository.findById(jobId).map(this::toResponse).orElse(null);
    }

    /** ประวัติการสร้างโครงการด้วย AI ทั้งหมดของ business นี้ (ล่าสุดก่อน) ใช้แสดงในหน้าประวัติของ wizard */
    public Page<AiPipelineJobResponse> list(UUID businessId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        return jobRepository.findByBusinessIdAndIsDeleteFalseOrderByCreatedDateDesc(businessId, pageable)
                .map(this::toResponse);
    }

    /** ถ้า backend ถูก restart กลางคัน job ที่ค้างสถานะ RUNNING ใน DB จะไม่มีวัน finish อีก มาร์คเป็น FAILED ให้ผู้ใช้เห็นว่าโดนขัดจังหวะ */
    @PostConstruct
    void markInterruptedJobsAsFailed() {
        List<AiPipelineJob> stale = jobRepository.findByStatusAndIsDeleteFalse("RUNNING");
        if (stale.isEmpty()) return;
        for (AiPipelineJob e : stale) {
            e.setStatus("FAILED");
            e.setFinished(true);
            e.setMessage("การสร้างโครงการถูกขัดจังหวะเนื่องจากระบบรีสตาร์ทระหว่างดำเนินการ กรุณาลองสร้างใหม่อีกครั้ง");
        }
        jobRepository.saveAll(stale);
    }

    private AiPipelineJobResponse toResponse(Job job) {
        List<AiPipelineJobResponse.Step> steps = new ArrayList<>();
        for (StepState s : job.steps) {
            steps.add(AiPipelineJobResponse.Step.builder().key(s.key).label(s.label).status(s.status).count(s.count).message(s.message).build());
        }
        return AiPipelineJobResponse.builder()
                .jobId(job.id).status(job.status).finished(!"RUNNING".equals(job.status))
                .projectId(job.projectId).projectCode(job.projectCode).projectName(job.projectName)
                .steps(steps).createdCounts(new LinkedHashMap<>(job.counts)).message(job.message)
                .prompt(job.prompt).durationWeeks(job.durationWeeks).aiModel(job.aiModel).createdDate(job.createdDate)
                .build();
    }

    private AiPipelineJobResponse toResponse(AiPipelineJob entity) {
        List<AiPipelineJobResponse.Step> steps = new ArrayList<>();
        if (entity.getSteps() != null) {
            for (Map<String, Object> m : entity.getSteps()) {
                steps.add(AiPipelineJobResponse.Step.builder()
                        .key(String.valueOf(m.get("key")))
                        .label(String.valueOf(m.get("label")))
                        .status(String.valueOf(m.get("status")))
                        .count(m.get("count") == null ? 0 : ((Number) m.get("count")).intValue())
                        .message(m.get("message") == null ? null : String.valueOf(m.get("message")))
                        .build());
            }
        }
        return AiPipelineJobResponse.builder()
                .jobId(entity.getId()).status(entity.getStatus()).finished(Boolean.TRUE.equals(entity.getFinished()))
                .projectId(entity.getProjectId()).projectCode(entity.getProjectCode()).projectName(entity.getProjectName())
                .steps(steps).createdCounts(entity.getCounts() == null ? new LinkedHashMap<>() : entity.getCounts())
                .message(entity.getMessage())
                .prompt(entity.getPrompt()).durationWeeks(entity.getDurationWeeks()).aiModel(entity.getAiModel())
                .createdDate(entity.getCreatedDate())
                .build();
    }

    private void persistJob(Job job, UUID businessId, String userId, AiProjectPipelineRequest request) {
        try {
            // New rows must not carry a pre-set id: @GeneratedValue + null @Version makes Hibernate treat it as detached.
            AiPipelineJob entity = job.id == null ? new AiPipelineJob() : jobRepository.findById(job.id).orElseGet(AiPipelineJob::new);
            entity.setBusinessId(businessId);
            entity.setCreatedByUserId(userId);
            entity.setProjectName(job.projectName != null ? job.projectName : request.getProjectName());
            entity.setPrompt(request.getPrompt());
            entity.setDurationWeeks(request.getDurationWeeks());
            entity.setAiModel(request.getModel());
            entity.setStatus(job.status);
            entity.setMessage(job.message);
            entity.setProjectId(job.projectId);
            entity.setProjectCode(job.projectCode);
            entity.setFinished(!"RUNNING".equals(job.status));

            List<Map<String, Object>> stepsJson = new ArrayList<>();
            for (StepState s : job.steps) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("key", s.key);
                m.put("label", s.label);
                m.put("status", s.status);
                m.put("count", s.count);
                m.put("message", s.message);
                stepsJson.add(m);
            }
            entity.setSteps(stepsJson);
            entity.setCounts(new LinkedHashMap<>(job.counts));
            UUID savedId = jobRepository.save(entity).getId();
            if (job.id == null) job.id = savedId;
        } catch (Exception e) {
            log.error("Failed to persist AI pipeline job history {}", job.id, e);
            if (job.id == null) job.id = UUID.randomUUID(); // history lost, but the job can still run and be polled
        }
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
            loadMembers(c);
            for (StepState step : job.steps) {
                step.status = "RUNNING";
                try {
                    switch (step.key) {
                        case "CUSTOMER" -> stepCustomer(c, step);
                        case "PROJECT" -> stepProject(c, step);
                        case "CONTRACT" -> stepContract(c, step);
                        case "WBS" -> stepWbs(c, step);
                        case "REQUIREMENT" -> stepRequirements(c, step);
                        case "DIAGRAM" -> stepDiagrams(c, step);
                        case "SPECIFICATION" -> stepSpecifications(c, step);
                        case "DESIGN_REVIEW" -> stepDesignReviews(c, step);
                        case "TASK" -> stepTasks(c, step);
                        case "TEST" -> stepTests(c, step);
                        case "MANUAL" -> stepManuals(c, step);
                        case "DELIVERY" -> stepDeliveries(c, step);
                        case "INVOICE" -> stepInvoices(c, step);
                        case "MA" -> stepMa(c, step);
                        default -> step.status = "SKIPPED";
                    }
                    if (c.quotaError != null && step.count == 0) step.message = QUOTA_WARNING;
                    if ("RUNNING".equals(step.status)) step.status = "DONE";
                    job.counts.put(step.key.toLowerCase(), step.count);
                } catch (Exception e) {
                    log.error("AI pipeline step {} failed", step.key, e);
                    step.status = "FAILED";
                    step.message = e.getMessage();
                    anyFailed = true;
                    if ("PROJECT".equals(step.key) || "CUSTOMER".equals(step.key)) {
                        markRemainingSkipped(job);
                        job.status = "FAILED";
                        job.message = ("CUSTOMER".equals(step.key) ? "สร้าง/จับคู่ลูกค้าไม่สำเร็จ: " : "สร้างโครงการไม่สำเร็จ: ") + e.getMessage();
                        persistJob(job, businessId, userId, request);
                        return;
                    }
                }
                persistJob(job, businessId, userId, request);
            }
            job.status = anyFailed || c.quotaError != null ? "COMPLETED_WITH_ERRORS" : "COMPLETED";
            job.message = c.quotaError != null ? QUOTA_WARNING + " [" + c.quotaError + "]"
                    : anyFailed ? "สร้างเสร็จบางส่วน มีบางขั้นตอนไม่สำเร็จ ตรวจสอบรายละเอียดในแต่ละขั้น" : "สร้างโครงการและโมดูลทั้งหมดสำเร็จ พร้อมให้ตรวจสอบ";
            persistJob(job, businessId, userId, request);
        } finally {
            BusinessContextHolder.clear();
        }
    }

    /** สมาชิกที่ active ของ business ใช้สุ่มเป็นผู้รับผิดชอบ (assignee/owner/reviewer/tester) ให้ทุก field ถูกเติมโดยไม่ต้องกรอกเอง */
    private void loadMembers(Ctx c) {
        try {
            userBusinessRepository.findByBusinessIdAndIsActiveTrue(c.businessId).forEach(ub -> {
                String name = profileRepository.findByUserId(ub.getUserId())
                        .map(LocalizationHelper::getFullName).filter(n -> n != null && !n.isBlank()).orElse(ub.getUserId());
                c.members.add(new Member(ub.getUserId(), name));
            });
        } catch (Exception e) {
            log.warn("AI pipeline: cannot load business members: {}", e.getMessage());
        }
    }

    private Member randomMember(Ctx c) {
        return c.members.isEmpty() ? null : c.members.get(ThreadLocalRandom.current().nextInt(c.members.size()));
    }

    private String randomName(Ctx c) {
        Member m = randomMember(c);
        return m == null ? null : cut(m.name(), 255);
    }

    private void markRemainingSkipped(Job job) {
        for (StepState s : job.steps) {
            if ("PENDING".equals(s.status)) s.status = "SKIPPED";
        }
    }

    // ===================== steps =====================

    private void stepCustomer(Ctx c, StepState step) {
        JsonNode root = ask(c, """
                You are an Enterprise CRM Specialist.
                Analyze the project brief and identify or invent the client/customer organization in Thailand.
                Respond ONLY with valid JSON in a ```json block, in the same language as the user's request:
                {
                  "customerName": "organization/client company name in Thailand if mentioned or implied in the prompt, else realistic Thai company name (e.g. บริษัท สยามนวัตกรรม ดิจิทัล จำกัด)",
                  "customerNameEn": "company name in English (e.g. Siam Digital Innovation Co., Ltd.)",
                  "contactPerson": "realistic Thai executive contact name with title (e.g. คุณสมชาย วิจิตรศิลป์)"
                }
                """, "รายละเอียดโครงการ: " + firstNonBlank(c.req.getPrompt(), c.req.getProjectName()), true);

        String aiCustName = txt(root, "customerName");
        String aiCustNameEn = txt(root, "customerNameEn");
        String aiContact = txt(root, "contactPerson");

        UUID customerId = null;
        List<PmCustomer> customers = customerRepository.findByBusinessIdAndIsActiveTrue(c.businessId);

        // 1. ถ้ามีชื่อ AI สกัดได้ ให้ลอง Match กับชื่อลูกค้าในระบบ
        if (aiCustName != null && !aiCustName.isBlank() && !customers.isEmpty()) {
            String needle = aiCustName.toLowerCase().trim();
            for (PmCustomer cust : customers) {
                if ((cust.getCompanyNameLocal() != null && cust.getCompanyNameLocal().toLowerCase().contains(needle))
                        || (cust.getCompanyNameEn() != null && cust.getCompanyNameEn().toLowerCase().contains(needle))) {
                    customerId = cust.getId();
                    thaiCustomerGenerator.enrichCustomerIfIncomplete(cust);
                    step.message = "จับคู่ลูกค้าเดิม: " + cust.getCompanyNameLocal();
                    break;
                }
            }
        }

        // 2. ถ้าไม่พบลูกค้าเดิม หรือไม่มีลูกค้าในระบบ -> สร้างลูกค้าสัญชาติไทยรายใหม่ ข้อมูลครบถ้วนทุกฟิลด์
        if (customerId == null) {
            PmCustomer autoCust = thaiCustomerGenerator.createAndSaveFullThaiCustomer(
                    c.businessId, aiCustName, aiCustNameEn, aiContact);
            customerId = autoCust.getId();
            step.message = "สร้างลูกค้าใหม่: " + autoCust.getCompanyNameLocal();
            log.info("Auto-created complete Thai customer '{}' ({}) for AI Project Pipeline", autoCust.getCompanyNameLocal(), customerId);
        }

        c.customerId = customerId;
        step.count = 1;
    }

    private void stepProject(Ctx c, StepState step) {
        UUID customerId = c.customerId != null ? c.customerId : c.req.getCustomerId();
        if (customerId == null) {
            PmCustomer autoCust = thaiCustomerGenerator.createAndSaveFullThaiCustomer(c.businessId, null, null, null);
            customerId = autoCust.getId();
        } else {
            customerRepository.findById(customerId).ifPresent(thaiCustomerGenerator::enrichCustomerIfIncomplete);
        }
        c.customerId = customerId;

        String customerContext = customerRepository.findById(customerId)
                .map(cust -> "\nลูกค้า: " + cust.getCompanyNameLocal())
                .orElse("");

        JsonNode root = ask(c, """
                You are a Lead Enterprise Software Architect & Project Director.
                Create the project charter for the request. Fill EVERY field.
                Respond ONLY with valid JSON in a ```json block, in the same language as the user's request:
                { "projectName": "professional title", "description": "plain text charter (objectives, scope, deliverables), max 1500 characters",
                  "estimatedDurationWeeks": 12, "budgetManday": 120, "priority": "Low | Medium | High | Critical" }
                """, "รายละเอียดโครงการ: " + firstNonBlank(c.req.getPrompt(), c.req.getProjectName())
                + (c.req.getProjectName() != null && !c.req.getProjectName().isBlank() ? "\nชื่อโครงการที่ผู้ใช้กำหนด: " + c.req.getProjectName() : "")
                + customerContext
                + "\nระยะเวลาเป้าหมาย: " + c.weeks + " สัปดาห์", true);

        String name = firstNonBlank(c.req.getProjectName(), txt(root, "projectName"), "โครงการใหม่ (AI Generated)");
        String desc = cut(firstNonBlank(txt(root, "description"), c.req.getPrompt()), 2000);
        int weeks = root != null && root.path("estimatedDurationWeeks").asInt(0) > 0 && c.req.getDurationWeeks() == null
                ? root.path("estimatedDurationWeeks").asInt() : c.weeks;
        c.weeks = weeks;

        PmCustomerProjectRequest pr = new PmCustomerProjectRequest();
        pr.setCustomerId(customerId);
        pr.setProjectCode(generateUniqueProjectCode());
        pr.setProjectName(cut(name, 255));
        pr.setDescription(desc);
        pr.setStartDate(c.startDate);
        pr.setPlannedEndDate(c.startDate.plusWeeks(c.weeks));
        pr.setBudgetManday(root != null && root.path("budgetManday").asInt(0) > 0 ? root.path("budgetManday").asInt() : c.weeks * 10);
        pr.setStatus("Planning");
        pr.setPriority(pickIgnoreCase(txt(root, "priority"), List.of("Low", "Medium", "High", "Critical"), "Medium"));
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
        cr.setContractNo(generateUniqueContractNo());
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
        projectRepository.findById(c.projectId).ifPresent(p -> {
            p.setContractId(c.contractId);
            projectRepository.save(p);
        });
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
            pq.setOwner(randomName(c));
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
                    c.wpColors.put(saved.getId(), wq.getColor());
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
                    "source": "who/what the requirement comes from, e.g. stakeholder, regulation, workshop",
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
            rq.setSource(cut(txt(n, "source"), 255));
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
                    "module": "system module/feature area name", "estimatedManday": 5, "description": "HTML (<h3>,<p>,<ul>,<li>)" } ] }
                """, projectContext(c) + "\n\nRequirements:\n" + numbered(c.requirements), false);

        int idx = 1;
        for (JsonNode n : arr(root, "specifications")) {
            PmSpecificationRequest sq = new PmSpecificationRequest();
            sq.setProjectId(c.projectId);
            sq.setSpecificationCode(String.format("SPEC-%03d", idx++));
            sq.setTitle(cut(txt(n, "title"), 255));
            sq.setSpecificationType(pick(txt(n, "specificationType"), SPEC_TYPES, "UI Specification"));
            sq.setPriority(pick(txt(n, "priority"), PRIORITIES, "MEDIUM"));
            sq.setModule(cut(txt(n, "module"), 255));
            Member owner = randomMember(c);
            if (owner != null) sq.setOwner(owner.userId());
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
        int failed = 0;
        for (JsonNode n : arr(root, "tasks")) {
            try {
            TaskRequest tq = new TaskRequest();
            Ref wp = refAt(c.workPackages, n.path("workPackageRef").asInt(0), idx - 1);
            tq.setWorkPackageId(wp.id());
            Ref spec = refAt(c.specs, n.path("specificationRef").asInt(0), -1);
            if (spec != null) tq.setSpecificationId(spec.id());
            Member assignee = randomMember(c);
            if (assignee != null) {
                tq.setAssigneeIds(List.of(assignee.userId()));
                tq.setAssignedTo(assignee.userId());
            }
            tq.setColor(c.wpColors.get(wp.id()));
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
            } catch (Exception e) {
                log.warn("AI pipeline: skip task #{}: {}", idx - 1, e.getMessage());
                failed++;
            }
        }
        step.count = c.tasks.size();
        if (c.tasks.isEmpty()) step.message = "AI ไม่สามารถสร้าง Task ได้";
        else if (failed > 0) step.message = "ข้าม " + failed + " task ที่บันทึกไม่ได้";
    }

    private void stepTests(Ctx c, StepState step) {
        if (c.tasks.isEmpty()) {
            throw new IllegalStateException("ไม่มี Task ให้ผูก Test Scenario (ขั้น Task ไม่สำเร็จหรือถูกปิดไว้)");
        }
        JsonNode root = ask(c, String.format("""
                You are a Lead QA Engineer. You MUST design at least one test scenario for EVERY task listed (Task 1 to %d).
                Each scenario must link to its corresponding task by number using "taskRef" (1-based index).
                For setup, infrastructure, or architecture tasks (such as Task 1), design Smoke Test, Environment Verification, or Setup Verification scenarios.
                Each scenario must contain 1-3 test cases. Fill EVERY field.
                priority is one of: LOW | MEDIUM | HIGH | CRITICAL. testType is one of: SIT | UAT.
                Respond ONLY with valid JSON in a ```json block, same language as the project:
                { "scenarios": [ { "taskRef": 1, "requirementRef": 1, "specificationRef": 1, "scenarioName": "...", "description": "HTML", "priority": "HIGH", "testType": "SIT",
                    "cases": [ { "title": "...", "testStep": "<ol><li>...</li></ol>", "expectedResult": "<p>...</p>", "priority": "MEDIUM" } ] } ] }
                """, c.tasks.size()), projectContext(c) + "\n\nTasks:\n" + numbered(c.tasks) + "\n\nRequirements:\n" + numbered(c.requirements) + "\n\nSpecifications:\n" + numbered(c.specs), false);

        int sIdx = 1;
        int cIdx = 1;
        int cases = 0;
        int failed = 0;
        Set<UUID> coveredTaskIds = new HashSet<>();
        for (JsonNode sn : arr(root, "scenarios")) {
            try {
            Ref task = refAt(c.tasks, sn.path("taskRef").asInt(0), sIdx - 1);
            String testType = pick(txt(sn, "testType"), Set.of("SIT", "UAT"), "SIT");
            String tester = randomName(c);
            Ref reqRef = refAt(c.requirements, sn.path("requirementRef").asInt(0), -1);
            Ref specRef = refAt(c.specs, sn.path("specificationRef").asInt(0), -1);
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
            coveredTaskIds.add(task.id());

            for (JsonNode cn : arr(sn, "cases")) {
                PmTestCaseRequest cq = new PmTestCaseRequest();
                cq.setProjectId(c.projectId);
                cq.setScenarioId(scenarioId);
                cq.setScenarioName(sq.getScenarioName());
                cq.setTaskId(task.id());
                cq.setRelatedTask(task.name());
                cq.setTester(tester);
                cq.setRelatedRequirement(reqRef == null ? null : reqRef.name());
                cq.setRelatedSpec(specRef == null ? null : specRef.name());
                cq.setTestCaseCode(String.format("TC-%03d", cIdx++));
                cq.setTitle(cut(txt(cn, "title"), 255));
                cq.setPriority(pick(txt(cn, "priority"), PRIORITIES, "MEDIUM"));
                cq.setTestStep(firstNonBlank(txt(cn, "testStep"), "<p>-</p>"));
                cq.setExpectedResult(firstNonBlank(txt(cn, "expectedResult"), "<p>-</p>"));
                cq.setTestDate(c.startDate.plusWeeks(c.weeks));
                cq.setTestStatus("Pending");
                cq.setTestType(testType);
                cq.setState(STATE_ADDED);
                try {
                    testCaseService.save(cq, c.businessId, c.userId);
                    cases++;
                } catch (Exception e) {
                    log.warn("AI pipeline: skip test case {}: {}", cq.getTestCaseCode(), e.getMessage());
                    failed++;
                }
            }
            } catch (Exception e) {
                log.warn("AI pipeline: skip scenario #{}: {}", sIdx - 1, e.getMessage());
                failed++;
            }
        }

        // รับประกันว่าทุก Task ต้องมี Test Scenario และ Test Case อย่างน้อย 1 รายการเสมอ
        for (Ref task : c.tasks) {
            if (coveredTaskIds.contains(task.id())) continue;
            try {
                String testType = "SIT";
                String tester = randomName(c);
                PmTestScenarioRequest sq = new PmTestScenarioRequest();
                sq.setProjectId(c.projectId);
                sq.setTaskId(task.id());
                sq.setScenarioCode(String.format("SC-%03d", sIdx++));
                sq.setScenarioName("ทดสอบ: " + cut(task.name(), 245));
                sq.setDescription("<p>ชุดทดสอบความถูกต้องและการทำงานของงาน: " + task.name() + "</p>");
                sq.setPriority("MEDIUM");
                sq.setTestType(testType);
                sq.setState(STATE_ADDED);
                UUID scenarioId = scenarioService.save(sq, c.businessId, c.userId);
                coveredTaskIds.add(task.id());

                PmTestCaseRequest cq = new PmTestCaseRequest();
                cq.setProjectId(c.projectId);
                cq.setScenarioId(scenarioId);
                cq.setScenarioName(sq.getScenarioName());
                cq.setTaskId(task.id());
                cq.setRelatedTask(task.name());
                cq.setTester(tester);
                cq.setTestCaseCode(String.format("TC-%03d", cIdx++));
                cq.setTitle("ตรวจสอบความสมบูรณ์ของงาน " + cut(task.name(), 220));
                cq.setPriority("MEDIUM");
                cq.setTestStep("<ol><li>ตรวจสอบผลลัพธ์และเงื่อนไขความสำเร็จของงาน " + task.name() + "</li><li>ตรวจสอบความถูกต้องของการทำงานและข้อผิดพลาด</li></ol>");
                cq.setExpectedResult("<p>การทำงานของงาน " + task.name() + " เสร็จสมบูรณ์ ถูกต้องตามข้อกำหนด และผ่านเกณฑ์การยอมรับ</p>");
                cq.setTestDate(c.startDate.plusWeeks(c.weeks));
                cq.setTestStatus("Pending");
                cq.setTestType(testType);
                cq.setState(STATE_ADDED);
                testCaseService.save(cq, c.businessId, c.userId);
                cases++;
            } catch (Exception e) {
                log.warn("AI pipeline: fallback scenario for task {} failed: {}", task.name(), e.getMessage());
                failed++;
            }
        }

        step.count = (sIdx - 1) + cases;
        step.message = (sIdx - 1) + " scenario, " + cases + " test case" + (failed > 0 ? " (ข้าม " + failed + " รายการที่บันทึกไม่ได้)" : "");
        if (sIdx == 1) step.message = "AI ไม่สามารถสร้าง Test Scenario ได้";
    }

    private void stepDeliveries(Ctx c, StepState step) {
        JsonNode root = ask(c, """
                You are a Delivery Manager. Plan the deliveries (2-4, the last one is FINAL), each optionally tied to a milestone by number. Fill EVERY field.
                deliveryType is one of: FINAL | PARTIAL | MILESTONE.
                IMPORTANT: For EACH delivery, you MUST provide 3 to 6 realistic acceptance checklist items in the 'checklists' array (e.g. source code inspection, test results verification, user manuals, deployment checklist). Do NOT leave 'checklists' empty!
                Respond ONLY with valid JSON in a ```json block, same language as the project:
                { "deliveries": [ { "milestoneRef": 1, "deliveryTitle": "...", "deliveryType": "PARTIAL", "deliverySummary": "HTML", "releaseNote": "HTML",
                    "checklists": [ { "itemName": "specific acceptance check item in project language", "itemCategory": "Documentation | Testing | Deployment | Training" } ] } ] }
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
            dq.setChecklists(checklists(d, dq.getDeliveryTitle()));
            if (idx == n) dq.setItems(deliveryItems(c));
            dq.setStatus("DRAFT");
            dq.setState(STATE_ADDED);
            UUID id = deliveryService.save(dq, c.businessId, c.userId);
            c.deliveries.add(new Ref(id, dq.getDeliveryTitle()));
            idx++;
        }
        step.count = c.deliveries.size();
        if (c.deliveries.isEmpty()) step.message = "AI ไม่สามารถวางแผนการส่งมอบได้";
    }

    private List<PmDeliveryChecklistRequest> checklists(JsonNode d, String deliveryTitle) {
        List<PmDeliveryChecklistRequest> out = new ArrayList<>();
        for (JsonNode k : arr(d, "checklists")) {
            String name = txt(k, "itemName");
            if (name.isBlank()) name = txt(k, "checklistName");
            if (name.isBlank()) name = txt(k, "name");
            if (!name.isBlank()) {
                PmDeliveryChecklistRequest cr = new PmDeliveryChecklistRequest();
                cr.setItemName(cut(name, 255));
                cr.setItemCategory(cut(txt(k, "itemCategory"), 100));
                cr.setIsChecked(false);
                cr.setSortOrder(out.size() + 1);
                cr.setState(STATE_ADDED);
                out.add(cr);
            }
        }
        if (out.isEmpty()) {
            List<String> defaultItems = List.of(
                    "ตรวจสอบความครบถ้วนของ Source Code และ Git Repository Handover",
                    "ตรวจสอบผลการทดสอบระบบ (UAT Acceptance & Test Results)",
                    "เอกสารคู่มือการใช้งานระบบ (User & Admin Manual)",
                    "เอกสารการติดตั้งและสถาปัตยกรรมระบบ (Deployment Architecture & Guide)",
                    "รายงานสรุปผลการส่งมอบและเอกสารรับรองงวดงาน (" + (deliveryTitle != null && !deliveryTitle.isBlank() ? deliveryTitle : "การตรวจรับงาน") + ")"
            );
            for (String itemName : defaultItems) {
                PmDeliveryChecklistRequest cr = new PmDeliveryChecklistRequest();
                cr.setItemName(itemName);
                cr.setItemCategory("Acceptance");
                cr.setIsChecked(false);
                cr.setSortOrder(out.size() + 1);
                cr.setState(STATE_ADDED);
                out.add(cr);
            }
        }
        return out;
    }

    /** ส่งมอบครั้งสุดท้ายแนบ Requirement + Specification ทั้งหมดของโครงการ */
    private List<PmDeliveryItemRequest> deliveryItems(Ctx c) {
        List<PmDeliveryItemRequest> out = new ArrayList<>();
        for (int i = 0; i < c.requirements.size(); i++) addItem(out, "REQUIREMENT", String.format("REQ-%03d", i + 1), c.requirements.get(i));
        for (int i = 0; i < c.specs.size(); i++) addItem(out, "SPECIFICATION", String.format("SPEC-%03d", i + 1), c.specs.get(i));
        return out;
    }

    private void addItem(List<PmDeliveryItemRequest> out, String type, String code, Ref ref) {
        PmDeliveryItemRequest ir = new PmDeliveryItemRequest();
        ir.setItemType(type);
        ir.setItemId(ref.id());
        ir.setItemCode(code);
        ir.setItemTitle(ref.name());
        ir.setItemStatus("DRAFT");
        ir.setSortOrder(out.size() + 1);
        ir.setState(STATE_ADDED);
        out.add(ir);
    }

    private void stepManuals(Ctx c, StepState step) {
        JsonNode root = ask(c, """
                You are a Technical Writer. Write user manuals for the project (max 3), each with 3-4 sections. Fill EVERY field.
                manualType is one of: USER | ADMIN | INSTALLATION | OPERATION | TROUBLESHOOT.
                Respond ONLY with valid JSON in a ```json block, same language as the project:
                { "manuals": [ { "manualTitle": "...", "manualType": "USER", "specificationRef": 1, "sections": [ { "sectionTitle": "...", "content": "HTML" } ] } ] }
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
            mq.setVersion("v1.0.0");
            Ref spec = refAt(c.specs, m.path("specificationRef").asInt(0), -1);
            if (spec != null) mq.setRelatedSpecId(spec.id());
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

        Map<Integer, List<PmInvoiceItemRequest>> itemsByDeliveryRef = new HashMap<>();
        try {
            JsonNode root = ask(c, """
                    You are a Senior Project Financial Controller & Billing Specialist.
                    Generate realistic invoice line items breakdown for each delivery milestone below.
                    Total contract value: """ + (c.contractValueText != null ? c.contractValueText : "unspecified") + """
                    
                    For each delivery, provide 1 to 3 realistic line items with sensible amounts matching the delivery scope and total contract value.
                    Fill EVERY field.
                    Respond ONLY with valid JSON in a ```json block, same language as the project:
                    {
                      "invoices": [
                        {
                          "deliveryRef": 1,
                          "items": [
                            { "itemName": "ชื่อรายการบริการ/ส่งมอบ", "description": "คำอธิบายงานแบบกระชับ", "amount": 100000.0 }
                          ]
                        }
                      ]
                    }
                    """, projectContext(c) + "\n\nDeliveries:\n" + numbered(c.deliveries), false);

            if (root != null) {
                for (JsonNode inv : arr(root, "invoices")) {
                    int ref = inv.path("deliveryRef").asInt(-1);
                    List<PmInvoiceItemRequest> list = new ArrayList<>();
                    int order = 1;
                    for (JsonNode it : arr(inv, "items")) {
                        PmInvoiceItemRequest ir = new PmInvoiceItemRequest();
                        ir.setItemName(cut(txt(it, "itemName"), 255));
                        ir.setDescription(cut(cleanHtmlText(txt(it, "description")), 255));
                        ir.setAmount(it.path("amount").isNumber() ? it.path("amount").decimalValue() : BigDecimal.ZERO);
                        ir.setSortOrder(order++);
                        ir.setState(STATE_ADDED);
                        list.add(ir);
                    }
                    if (!list.isEmpty()) {
                        itemsByDeliveryRef.put(ref, list);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("AI pipeline: invoice items generation fallback to delivery details: {}", e.getMessage());
        }

        int count = 0;
        StringBuilder errors = new StringBuilder();
        int dIdx = 1;
        for (Ref d : c.deliveries) {
            try {
                List<PmInvoiceItemRequest> customItems = itemsByDeliveryRef.get(dIdx);
                deliveryService.createInvoiceFromDelivery(d.id(), c.businessId, c.userId, customItems);
                count++;
            } catch (Exception e) {
                errors.append(d.name()).append(": ").append(e.getMessage()).append("; ");
            }
            dIdx++;
        }
        step.count = count;
        if (errors.length() > 0) step.message = "สร้างบางรายการไม่ได้: " + errors;
    }

    private static String cleanHtmlText(String text) {
        if (text == null) return null;
        return text.replaceAll("<[^>]*>", "").trim();
    }


    private static final String MERMAID_RULES = """
            Respond ONLY with valid Mermaid code in a ```mermaid block, no other text. Node/entity labels in the same language as the project. Max 25 nodes / 15 entities.
            flowchart types (DFD, Use Case, Flowchart): first line `flowchart TD`. Node ids are ASCII letters+digits only (E1, P2). Labels ALWAYS in double quotes.
            Edges: `A --> B` or `A -->|"label"| B`. Do NOT use subgraph, style, classDef, click, or any other syntax.
            Shapes: DFD external entity `E1["Name"]`, process `P1(("Name"))`, data store `D1[("Name")]`.
            Use Case actor `A1(["Actor"])`, use case `U1(("Use case"))`. Flowchart start/end `S1(["Start"])`, step `T1["Step"]`, decision `D1{"Question?"}`.
            ER: first line `erDiagram`; relation `CUSTOMER ||--o{ ORDER : places`; entity block `CUSTOMER {` + one attribute per line like `string id PK` + `}`. Entity names UPPERCASE, no spaces.
            """;

    // {type, name, instruction}: fixed system-level set, one AI call each (a single big call gets truncated).
    private static final String[][] DIAGRAM_SET = {
            {"DFD", "DFD Level 0", "a DFD Level 0 (context diagram): the system as one process, all external entities and the main data flows in/out"},
            {"DFD", "DFD Level 1", "a DFD Level 1: break the system into its main processes with data stores, external entities and every data flow between them"},
            {"Use Case", "Use Case Diagram", "the use case diagram of the whole system: all actors and all main use cases with their relations"},
            {"Flowchart", "Main Process Flowchart", "the flowchart of the single most important business process of the system, including decisions and alternative paths"},
            {"ER", "ER Diagram", "the ER diagram of the whole system: every entity across all requirements with key attributes and relations with cardinality"}};

    /**
     * ให้ AI ตอบเป็น Mermaid แล้วเก็บเฉพาะ script ไว้ใน diagram tab (ไม่มี XML) ตอนผู้ใช้เปิดหน้า Diagram ครั้งแรก
     * หน้าเว็บจะให้ draw.io (ปลั๊กอิน sicMermaid) แปลงเป็นแผนภาพและบันทึก XML กลับเอง
     */
    private void stepDiagrams(Ctx c, StepState step) {
        String ctx = projectContext(c) + "\n\nRequirements:\n" + numbered(c.requirements);
        int made = 0;
        for (String[] d : DIAGRAM_SET) {
            try {
                boolean er = "ER".equals(d[0]);
                String script = askRetry(c, "You are a System Analyst. Create exactly ONE diagram of type \"" + d[0] + "\": " + d[2]
                        + ". " + MERMAID_RULES, ctx, false, raw -> parseMermaid(raw, er));
                if (script != null) {
                    saveDiagram(c, d[0], d[1], script);
                    made++;
                }
            } catch (Exception e) {
                log.warn("AI pipeline: skip diagram {}: {}", d[1], e.getMessage());
            }
        }
        step.count = made;
        if (made == 0) step.message = "AI ไม่สามารถสร้าง Diagram ได้";
        else if (made < DIAGRAM_SET.length) step.message = "สร้างได้ " + made + "/" + DIAGRAM_SET.length + " diagram";
    }

    /** เช็คแค่ว่าเป็น Mermaid ชนิดที่ขอมาจริง (ER ต้องขึ้นต้น erDiagram, ที่เหลือ flowchart/graph) การแปลงจริงทำที่ draw.io ฝั่งหน้าเว็บ */
    private String parseMermaid(String raw, boolean er) {
        String code = aiProvider.extractMermaidScript(raw);
        if (code == null) code = raw.replaceAll("```\\w*", "").trim();
        String header = code.lines().map(String::strip).filter(l -> !l.isEmpty() && !l.startsWith("%%")).findFirst().orElse("").toLowerCase();
        boolean isEr = header.startsWith("erdiagram");
        boolean isFlow = header.startsWith("flowchart") || header.startsWith("graph");
        if (!(er ? isEr : isFlow) || code.lines().count() < 3) {
            throw new IllegalArgumentException("Unexpected Mermaid header: " + header);
        }
        return code;
    }

    private void saveDiagram(Ctx c, String type, String name, String mermaidScript) {
        PmDiagramTabRequest dq = new PmDiagramTabRequest();
        dq.setProjectId(c.projectId);
        dq.setName(name);
        dq.setDiagramType(type);
        dq.setMermaidScript(mermaidScript);
        // system-level diagram: trace to every requirement so change-request impact analysis finds it
        dq.setRelatedRequirementIds(c.requirements.stream().map(Ref::id).toList());
        dq.setGraphData(new LinkedHashMap<>());
        dq.setIsActive(true);
        PmDiagramTabResponse tab = diagramTabService.createTab(dq);
        c.diagrams.add(new Ref(tab.getId(), name));
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
            rq.setReviewer(randomName(c));
            rq.setAssignedTo(randomName(c));
            rq.setDueDate(c.startDate.plusWeeks(c.weeks));
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
                You are a Maintenance & Support Manager and Technical Lead. Anticipate 2-3 realistic post-go-live support tickets for this project. Fill EVERY field.
                ticketType is one of: BUG_SUPPORT | DATA_ISSUE | USER_SUPPORT | CHANGE_REQUEST. severity is one of: LOW | MEDIUM | HIGH | CRITICAL.
                IMPORTANT: For EACH ticket, you MUST provide 'resolutionSummary' with a realistic, professional technical resolution method formatted in HTML (<p>, <ul>, <li>, <strong>). Explain root cause analysis, troubleshooting steps, and solution. Do NOT leave 'resolutionSummary' empty.
                Respond ONLY with valid JSON in a ```json block, same language as the project:
                { "tickets": [ { "title": "...", "description": "HTML description of the issue", "resolutionSummary": "HTML root cause and technical resolution steps", "ticketType": "BUG_SUPPORT", "severity": "MEDIUM" } ] }
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
            
            String res = firstNonBlank(txt(t, "resolutionSummary"), txt(t, "resolution"), txt(t, "solution"));
            if (res == null || res.isBlank()) {
                String title = tq.getTitle() != null ? tq.getTitle() : "ปัญหาที่แจ้ง";
                res = switch (tq.getTicketType()) {
                    case BUG_SUPPORT -> "<p><strong>สาเหตุของปัญหา:</strong> พบข้อผิดพลาดในการประมวลผลข้อมูล (" + title + ")</p>"
                            + "<p><strong>แนวทางแก้ไขปัญหา:</strong></p><ul>"
                            + "<li>ตรวจสอบ Log และทำ Unit/Integration Test เพื่อจำลองเงื่อนไขที่เกิดปัญหา</li>"
                            + "<li>แก้ไข Bug ใน Source Code พร้อมป้องกันผลข้างเคียง (Side Effect)</li>"
                            + "<li>ทดสอบผลบน Staging Environment ก่อนปล่อย Patch อัปเดต</li></ul>";
                    case DATA_ISSUE -> "<p><strong>สาเหตุของปัญหา:</strong> ข้อมูลในระบบไม่สอดคล้องกันเนื่องจากเงื่อนไขการซิงค์ข้อมูล</p>"
                            + "<p><strong>แนวทางแก้ไขปัญหา:</strong></p><ul>"
                            + "<li>ตรวจสอบความสอดคล้องของข้อมูล (Data Consistency & Foreign Keys)</li>"
                            + "<li>รัน Script ปรับปรุงและกู้คืนข้อมูลที่ได้รับผลกระทบ</li>"
                            + "<li>เพิ่มระบบ Validation ป้องกันไม่ให้เกิดข้อมูลไม่ถูกต้องซ้ำอีก</li></ul>";
                    case CHANGE_REQUEST -> "<p><strong>การวิเคราะห์ความต้องการ:</strong> คำขอปรับปรุงฟังก์ชันเพิ่มเติม (" + title + ")</p>"
                            + "<p><strong>แนวทางดำเนินการ:</strong></p><ul>"
                            + "<li>ประเมินผลกระทบ (Impact Analysis) และกำหนดขอบเขตงาน</li>"
                            + "<li>ออกแบบ UI และ Flow การทำงานร่วมกับทีมผู้ใช้งาน</li>"
                            + "<li>กำหนดแผนงานพัฒนาและทดสอบในรอบ Release ถัดไป</li></ul>";
                    default -> "<p><strong>การให้บริการผู้ใช้งาน:</strong> ให้คำปรึกษาและแนะนำแนวทางการใช้งาน (" + title + ")</p>"
                            + "<p><strong>แนวทางดำเนินการ:</strong></p><ul>"
                            + "<li>ตรวจสอบสิทธิ์การใช้งาน (User Permissions) ของผู้ใช้งาน</li>"
                            + "<li>แนะนำขั้นตอนการปฏิบัติงานที่ถูกต้องตามคู่มือการใช้งานระบบ</li>"
                            + "<li>จัดทำบันทึกสรุปแนวทางการใช้งานสำหรับทีมงาน</li></ul>";
                };
            }
            tq.setResolutionSummary(res);

            Member assignee = randomMember(c);
            if (assignee != null) tq.setAssignedToIds(List.of(assignee.userId()));
            LocalDate goLive = c.startDate.plusWeeks(c.weeks);
            tq.setStartDate(goLive.plusDays(1));
            tq.setStartTime("09:00");
            tq.setEndDate(goLive.plusDays(3));
            tq.setEndTime("18:00");
            tq.setReportedBy(c.userId);
            tq.setState(STATE_ADDED);
            maTicketService.save(tq, c.businessId, c.userId);
            count++;
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

    private static final String QUOTA_WARNING = "⚠ โควต้า/เครดิต/โทเคนของ AI หมด ขั้นตอนที่เหลือจึงสร้างไม่ได้ กรุณาเติมเครดิตหรือเปลี่ยนโมเดลแล้วลองใหม่";
    private static final int AI_MAX_ATTEMPTS = 3;
    private static final String RETRY_HINT = "\n\nIMPORTANT: your previous answer was empty, truncated or in the wrong format. "
            + "Answer again in the EXACT requested format only (complete and valid): fewer items, short texts, every bracket closed.";

    /** เรียก AI + parse JSON; ล้มเหลว (API error/429/timeout/JSON ถูกตัด) ลองใหม่สูงสุด 3 ครั้ง โดยบอกให้ตอบสั้นลงในรอบถัดไป */
    private JsonNode ask(Ctx c, String systemPrompt, String userPrompt, boolean withAttachments) {
        return askRetry(c, systemPrompt, userPrompt, withAttachments, this::parseJson);
    }

    /** parser คืน null หรือโยน exception = ใช้ไม่ได้ → ลองใหม่ */
    private <T> T askRetry(Ctx c, String systemPrompt, String userPrompt, boolean withAttachments, Function<String, T> parser) {
        if (c.quotaError != null) return null;
        for (int attempt = 1; attempt <= AI_MAX_ATTEMPTS; attempt++) {
            T result = askOnce(c, attempt == 1 ? systemPrompt : systemPrompt + RETRY_HINT, userPrompt, withAttachments, parser);
            if (result != null) return result;
            if (c.quotaError != null) break;
            log.warn("AI pipeline: attempt {}/{} returned no usable JSON", attempt, AI_MAX_ATTEMPTS);
            if (attempt < AI_MAX_ATTEMPTS) {
                try {
                    Thread.sleep(2000L * attempt);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
        return null;
    }

    private <T> T askOnce(Ctx c, String systemPrompt, String userPrompt, boolean withAttachments, Function<String, T> parser) {
        try {
            String raw = aiProvider.generateRawResponse(userPrompt, systemPrompt, c.req.getModel(),
                    withAttachments ? c.req.getAttachments() : null);
            String quota = PmAiProviderServiceImpl.takeQuotaError();
            if (quota != null) {
                c.quotaError = quota;
                return null;
            }
            if (raw == null || raw.isBlank() || "{}".equals(raw.trim())) {
                log.warn("AI pipeline: empty response (null/blank/empty object) from model {}; see 'AI API' log above for HTTP/network cause", c.req.getModel());
                return null;
            }
            try {
                return parser.apply(raw);
            } catch (Exception e) {
                String t = raw.trim();
                log.warn("AI pipeline: cannot parse response ({} chars, ends with '{}'): {}",
                        t.length(), t.substring(Math.max(0, t.length() - 80)).replace('\n', ' '), e.getMessage());
                return null;
            }
        } catch (Exception e) {
            log.warn("AI pipeline: AI call failed: {}", e.getMessage());
            return null;
        }
    }

    private JsonNode parseJson(String raw) {
        try {
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
            JsonNode root = objectMapper.readTree(json);
            return root != null && root.isObject() && !root.isEmpty() ? root : null;
        } catch (Exception e) {
            throw new IllegalArgumentException(e.getMessage(), e);
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

    /** ป้องกันการกด "สร้างโครงการ" ซ้ำ (เช่น ดับเบิลคลิก/เปิดหลายแท็บ) ระหว่างที่ prompt เดียวกันของ business เดียวกันยังรันอยู่ */
    private void rejectIfDuplicateRunning(UUID businessId, String prompt) {
        String normalized = prompt == null ? "" : prompt.trim();
        boolean duplicate = jobs.values().stream().anyMatch(j ->
                "RUNNING".equals(j.status)
                        && businessId.equals(j.businessId)
                        && normalized.equalsIgnoreCase(j.prompt == null ? "" : j.prompt.trim()));
        if (duplicate) {
            throw new IllegalStateException("มีการสร้างโครงการด้วยข้อความเดียวกันนี้กำลังทำงานอยู่แล้ว กรุณารอให้เสร็จก่อนสร้างซ้ำ");
        }
    }

    /** สุ่ม project code แล้วเช็คชนกับที่มีอยู่ในระบบ วนจนกว่าจะไม่ซ้ำ (กันกรณีสุ่มเลขชนกันแม้จะไม่น่าเกิดบ่อย) */
    private String generateUniqueProjectCode() {
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        for (int attempt = 0; attempt < 50; attempt++) {
            String code = "PRJ-" + datePart + "-" + String.format("%03d", ThreadLocalRandom.current().nextInt(1000));
            if (!projectRepository.existsByProjectCode(code)) return code;
        }
        return "PRJ-" + datePart + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /** เช่นเดียวกับ generateUniqueProjectCode แต่สำหรับเลขที่สัญญา */
    private String generateUniqueContractNo() {
        String yearPart = String.valueOf(LocalDate.now().getYear());
        for (int attempt = 0; attempt < 50; attempt++) {
            String code = "CT-" + yearPart + "-" + String.format("%03d", ThreadLocalRandom.current().nextInt(1000));
            if (!contractRepository.existsByContractNo(code)) return code;
        }
        return "CT-" + yearPart + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}


