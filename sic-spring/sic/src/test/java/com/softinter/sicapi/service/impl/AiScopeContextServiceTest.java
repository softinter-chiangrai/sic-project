package com.softinter.sicapi.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.softinter.sicapi.dto.request.GenerateSpecDraftRequest;
import com.softinter.sicapi.entity.enums.TraceRelationship;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmDiagramTab;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.entity.pm.PmTraceLink;
import com.softinter.sicapi.repository.pm.*;
import com.softinter.sicapi.service.TraceLinkService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/** ตรวจว่าบริบทขอบเขตที่ส่งให้ AI มีโครงการ เอกสารที่ผูก ความสัมพันธ์ และรายชื่อเอกสารอื่น */
class AiScopeContextServiceTest {

    PmCustomerProjectRepository projectRepo = Mockito.mock(PmCustomerProjectRepository.class);
    PmRequirementRepository reqRepo = Mockito.mock(PmRequirementRepository.class);
    PmSpecificationRepository specRepo = Mockito.mock(PmSpecificationRepository.class);
    PmDiagramTabRepository diagramRepo = Mockito.mock(PmDiagramTabRepository.class);
    PmTestScenarioRepository scenarioRepo = Mockito.mock(PmTestScenarioRepository.class);
    PmTaskRepository taskRepo = Mockito.mock(PmTaskRepository.class);
    TraceLinkService traceService = Mockito.mock(TraceLinkService.class);

    AiScopeContextService service = new AiScopeContextService(new ObjectMapper(), projectRepo, reqRepo, specRepo,
            diagramRepo, scenarioRepo, taskRepo, traceService);

    @Test
    void includesProjectLinkedDocsTraceAndInventory() {
        UUID projectId = UUID.randomUUID(), reqId = UUID.randomUUID(), dfdId = UUID.randomUUID();

        PmCustomerProject project = new PmCustomerProject();
        project.setProjectCode("PRJ-1");
        project.setProjectName("ระบบจองห้องประชุม");
        project.setDescription("<p>จองห้องผ่านเว็บ</p>");
        when(projectRepo.findById(projectId)).thenReturn(Optional.of(project));

        PmRequirement req = new PmRequirement();
        req.setRequirementCode("REQ-001");
        req.setTitle("ผู้ใช้จองห้องได้");
        req.setDescription("<b>เลือกวันและเวลา</b>");
        when(reqRepo.findById(reqId)).thenReturn(Optional.of(req));
        when(reqRepo.findByBusinessIdAndProjectIdAndIsDeleteFalse(any(), any())).thenReturn(List.of(req));

        PmDiagramTab dfd = new PmDiagramTab();
        dfd.setDiagramCode("DFD-1");
        dfd.setName("Booking flow");
        when(diagramRepo.findById(dfdId)).thenReturn(Optional.of(dfd));

        PmTraceLink link = new PmTraceLink();
        link.setSourceType("REQUIREMENT");
        link.setSourceId(reqId);
        link.setTargetType("DFD");
        link.setTargetId(dfdId);
        link.setRelationshipType(TraceRelationship.DESIGNED_BY);
        when(traceService.getFullTrace("REQUIREMENT", reqId)).thenReturn(List.of(link));

        GenerateSpecDraftRequest request = new GenerateSpecDraftRequest();
        request.setProjectId(projectId);
        request.setRequirementId(reqId);

        String ctx = service.build(request);

        assertTrue(ctx.contains("PRJ-1 - ระบบจองห้องประชุม"), ctx);
        assertTrue(ctx.contains("จองห้องผ่านเว็บ") && !ctx.contains("<p>"), "ต้องตัด html: " + ctx);
        assertTrue(ctx.contains("[REQUIREMENT] REQ-001 ผู้ใช้จองห้องได้: เลือกวันและเวลา"), ctx);
        assertTrue(ctx.contains("--DESIGNED_BY--> [DFD] DFD-1 Booking flow"), ctx);
        assertTrue(ctx.contains("Other Requirements in this project (1): REQ-001"), ctx);
        assertTrue(ctx.contains("strictly within the scope"), ctx);
    }

    @Test
    void noProject_returnsEmptyAndNeverThrows() {
        assertEquals("", service.build(new GenerateSpecDraftRequest()));
        assertEquals("", service.build(null));
    }
}
