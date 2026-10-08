package com.softinter.sicapi.service.impl;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.softinter.sicapi.dto.response.ImpactAnalysisResponse;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmDelivery;
import com.softinter.sicapi.entity.pm.PmDeliveryItem;
import com.softinter.sicapi.entity.pm.PmDesignReview;
import com.softinter.sicapi.entity.pm.PmInvoice;
import com.softinter.sicapi.entity.pm.PmMaTicket;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.entity.pm.PmSpecification;
import com.softinter.sicapi.entity.pm.PmUserManual;
import com.softinter.sicapi.repository.pm.ChangeImpactAnalysisRepository;
import com.softinter.sicapi.repository.pm.PmBugRepository;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmDeliveryItemRepository;
import com.softinter.sicapi.repository.pm.PmDeliveryRepository;
import com.softinter.sicapi.repository.pm.PmDesignReviewRepository;
import com.softinter.sicapi.repository.pm.PmDiagramTabRepository;
import com.softinter.sicapi.repository.pm.PmInvoiceRepository;
import com.softinter.sicapi.repository.pm.PmMaTicketRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationRepository;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.pm.PmTestCaseRepository;
import com.softinter.sicapi.repository.pm.PmUserManualRepository;
import com.softinter.sicapi.service.TraceLinkService;

/** CR ที่เป้าหมายเป็นเอกสารที่ไม่มี trace link ตรงๆ (Design Review, Delivery, User Manual, Invoice, MA Ticket) ต้องไม่ได้ผลวิเคราะห์ว่าง */
class ImpactAnalysisDesignReviewTest {

    private final PmDesignReviewRepository reviewRepo = mock(PmDesignReviewRepository.class);
    private final PmSpecificationRepository specRepo = mock(PmSpecificationRepository.class);
    private final PmDeliveryRepository deliveryRepo = mock(PmDeliveryRepository.class);
    private final PmDeliveryItemRepository deliveryItemRepo = mock(PmDeliveryItemRepository.class);
    private final PmUserManualRepository manualRepo = mock(PmUserManualRepository.class);
    private final PmInvoiceRepository invoiceRepo = mock(PmInvoiceRepository.class);
    private final PmMaTicketRepository ticketRepo = mock(PmMaTicketRepository.class);
    private final PmCustomerProjectRepository projectRepo = mock(PmCustomerProjectRepository.class);
    private final TraceLinkService traceLinkService = mock(TraceLinkService.class);
    private ImpactAnalysisServiceImpl service;

    @BeforeEach
    void setUp() {
        TraceLinkService.ImpactTraceResult empty = new TraceLinkService.ImpactTraceResult();
        empty.setImpacted(new HashMap<>());
        when(traceLinkService.getImpactedItems(any(), any())).thenReturn(empty);

        service = mock(ImpactAnalysisServiceImpl.class, org.mockito.Mockito.CALLS_REAL_METHODS);
        ReflectionTestUtils.setField(service, "designReviewRepository", reviewRepo);
        ReflectionTestUtils.setField(service, "specificationRepository", specRepo);
        ReflectionTestUtils.setField(service, "deliveryRepository", deliveryRepo);
        ReflectionTestUtils.setField(service, "deliveryItemRepository", deliveryItemRepo);
        ReflectionTestUtils.setField(service, "userManualRepository", manualRepo);
        ReflectionTestUtils.setField(service, "invoiceRepository", invoiceRepo);
        ReflectionTestUtils.setField(service, "maTicketRepository", ticketRepo);
        ReflectionTestUtils.setField(service, "customerProjectRepository", projectRepo);
        ReflectionTestUtils.setField(service, "traceLinkService", traceLinkService);
        ReflectionTestUtils.setField(service, "customerRepository", mock(com.softinter.sicapi.repository.pm.PmCustomerRepository.class));
        ReflectionTestUtils.setField(service, "requirementRepository", mock(PmRequirementRepository.class));
        ReflectionTestUtils.setField(service, "taskRepository", mock(PmTaskRepository.class));
        ReflectionTestUtils.setField(service, "testCaseRepository", mock(PmTestCaseRepository.class));
        ReflectionTestUtils.setField(service, "bugRepository", mock(PmBugRepository.class));
        ReflectionTestUtils.setField(service, "diagramTabRepository", mock(PmDiagramTabRepository.class));
        ReflectionTestUtils.setField(service, "customerContractRepository", mock(PmCustomerContractRepository.class));
        ReflectionTestUtils.setField(service, "repository", mock(ChangeImpactAnalysisRepository.class));
    }

    private PmCustomerProject project(UUID projectId, UUID customerId) {
        PmCustomerProject p = new PmCustomerProject();
        p.setId(projectId);
        p.setCustomerId(customerId);
        when(projectRepo.findById(projectId)).thenReturn(Optional.of(p));
        return p;
    }

    @Test
    void designReviewTarget_resolvesToReviewedSpecificationAndItsRequirement() {
        UUID reviewId = UUID.randomUUID();
        UUID specId = UUID.randomUUID();
        UUID reqId = UUID.randomUUID();

        PmDesignReview review = new PmDesignReview();
        // frontend ส่งชนิดแบบตัวแรกพิมพ์ใหญ่ ต้องถูก normalize เป็น SPECIFICATION
        review.setReviewItemType("Specification");
        review.setReviewItemId(specId);
        when(reviewRepo.findById(reviewId)).thenReturn(Optional.of(review));

        PmRequirement requirement = new PmRequirement();
        requirement.setId(reqId);
        PmSpecification spec = new PmSpecification();
        spec.setId(specId);
        spec.setRequirement(requirement);
        when(specRepo.findById(specId)).thenReturn(Optional.of(spec));

        ImpactAnalysisResponse result = service.previewImpact("DESIGN_REVIEW", reviewId);

        assertNotNull(result);
        assertArrayEquals(new UUID[] { reqId }, result.getImpactedRequirementIds());
    }

    @Test
    void deliveryTarget_impactsItsItemsAndProject() {
        UUID deliveryId = UUID.randomUUID(), projectId = UUID.randomUUID(), customerId = UUID.randomUUID();
        UUID reqId = UUID.randomUUID(), specId = UUID.randomUUID(), caseId = UUID.randomUUID();
        PmDelivery delivery = new PmDelivery();
        delivery.setProjectId(projectId);
        when(deliveryRepo.findById(deliveryId)).thenReturn(Optional.of(delivery));
        project(projectId, customerId);
        when(deliveryItemRepo.findByDeliveryIdAndIsDeleteFalseOrderBySortOrderAsc(deliveryId))
                .thenReturn(List.of(item("REQUIREMENT", reqId), item("specification", specId), item("TEST_CASE", caseId), item("USER_MANUAL", UUID.randomUUID())));

        ImpactAnalysisResponse result = service.previewImpact("DELIVERY", deliveryId);

        assertArrayEquals(new UUID[] { reqId }, result.getImpactedRequirementIds());
        assertArrayEquals(new UUID[] { specId }, result.getImpactedSpecIds());
        assertArrayEquals(new UUID[] { caseId }, result.getImpactedTestCaseIds());
        assertArrayEquals(new UUID[] { projectId }, result.getImpactedProjectIds());
        assertArrayEquals(new UUID[] { customerId }, result.getImpactedCustomerIds());
    }

    @Test
    void userManualTarget_followsItsSpecificationAndAddsProject() {
        UUID manualId = UUID.randomUUID(), specId = UUID.randomUUID(), reqId = UUID.randomUUID();
        UUID projectId = UUID.randomUUID(), customerId = UUID.randomUUID();
        PmUserManual manual = new PmUserManual();
        manual.setRelatedSpecId(specId);
        manual.setProjectId(projectId);
        when(manualRepo.findById(manualId)).thenReturn(Optional.of(manual));
        project(projectId, customerId);

        PmRequirement requirement = new PmRequirement();
        requirement.setId(reqId);
        PmSpecification spec = new PmSpecification();
        spec.setId(specId);
        spec.setRequirement(requirement);
        when(specRepo.findById(specId)).thenReturn(Optional.of(spec));
        when(specRepo.findById(eq(specId))).thenReturn(Optional.of(spec));

        ImpactAnalysisResponse result = service.previewImpact("USER_MANUAL", manualId);

        assertArrayEquals(new UUID[] { reqId }, result.getImpactedRequirementIds());
        assertEquals(List.of(projectId), List.of(result.getImpactedProjectIds()));
        assertEquals(List.of(customerId), List.of(result.getImpactedCustomerIds()));
    }

    @Test
    void invoiceAndMaTicketTargets_impactProjectAndCustomerOnly() {
        UUID invoiceId = UUID.randomUUID(), ticketId = UUID.randomUUID();
        UUID projectId = UUID.randomUUID(), customerId = UUID.randomUUID();
        PmInvoice invoice = new PmInvoice();
        invoice.setProjectId(projectId);
        invoice.setCustomerId(customerId);
        when(invoiceRepo.findById(invoiceId)).thenReturn(Optional.of(invoice));
        PmMaTicket ticket = new PmMaTicket();
        ticket.setProjectId(projectId);
        ticket.setCustomerId(customerId);
        when(ticketRepo.findById(ticketId)).thenReturn(Optional.of(ticket));
        project(projectId, customerId);

        for (ImpactAnalysisResponse r : List.of(service.previewImpact("INVOICE", invoiceId), service.previewImpact("MA_TICKET", ticketId))) {
            assertArrayEquals(new UUID[] { projectId }, r.getImpactedProjectIds());
            assertArrayEquals(new UUID[] { customerId }, r.getImpactedCustomerIds());
            assertEquals(0, r.getImpactedRequirementIds().length);
        }
    }

    @Test
    void specificationChange_listsManualsDeliveriesInvoicesAndMaTicketsDerivedFromTheirOwnRelations() {
        UUID targetSpec = UUID.randomUUID(), specA = UUID.randomUUID(), reqId = UUID.randomUUID(), projectId = UUID.randomUUID();
        UUID manualId = UUID.randomUUID(), deliveryId = UUID.randomUUID(), invoiceId = UUID.randomUUID(), ticketId = UUID.randomUUID();

        PmRequirement requirement = new PmRequirement();
        requirement.setId(reqId);
        requirement.setProjectId(projectId);
        PmSpecification spec = new PmSpecification();
        spec.setId(specA);
        spec.setRequirement(requirement);
        when(specRepo.findById(specA)).thenReturn(Optional.of(spec));
        TraceLinkService.ImpactTraceResult traced = new TraceLinkService.ImpactTraceResult();
        traced.setImpacted(new HashMap<>(java.util.Map.of("SPECIFICATION", new java.util.HashSet<>(List.of(specA)))));
        when(traceLinkService.getImpactedItems(eq("SPECIFICATION"), eq(targetSpec))).thenReturn(traced);
        project(projectId, UUID.randomUUID());

        PmUserManual manual = new PmUserManual();
        manual.setId(manualId);
        manual.setManualCode("MAN-001");
        when(manualRepo.findByRelatedSpecIdInAndIsDeleteFalse(any())).thenReturn(List.of(manual));
        PmDeliveryItem di = item("SPECIFICATION", specA);
        di.setDeliveryId(deliveryId);
        PmDeliveryItem unrelated = item("SPECIFICATION", UUID.randomUUID()); // ชื่อไม่ตรงกับ Spec ที่กระทบ ต้องไม่นับ
        unrelated.setDeliveryId(UUID.randomUUID());
        when(deliveryItemRepo.findByItemIdInAndIsDeleteFalse(any())).thenReturn(List.of(di, unrelated));
        PmDelivery delivery = new PmDelivery();
        delivery.setId(deliveryId);
        when(deliveryRepo.findAllById(any())).thenReturn(List.of(delivery));
        PmInvoice invoice = new PmInvoice();
        invoice.setId(invoiceId);
        when(invoiceRepo.findByDeliveryIdInAndIsDeleteFalse(any())).thenReturn(List.of(invoice));
        PmMaTicket ticket = new PmMaTicket();
        ticket.setId(ticketId);
        when(ticketRepo.findByProjectIdInAndIsDeleteFalse(any())).thenReturn(List.of(ticket));

        ImpactAnalysisResponse result = service.previewImpact("SPECIFICATION", targetSpec);

        assertArrayEquals(new UUID[] { manualId }, result.getImpactedManualIds());
        assertArrayEquals(new UUID[] { deliveryId }, result.getImpactedDeliveryIds());
        assertArrayEquals(new UUID[] { invoiceId }, result.getImpactedInvoiceIds());
        assertArrayEquals(new UUID[] { ticketId }, result.getImpactedMaTicketIds());
    }

    private static PmDeliveryItem item(String type, UUID id) {
        PmDeliveryItem i = new PmDeliveryItem();
        i.setItemType(type);
        i.setItemId(id);
        return i;
    }
}
