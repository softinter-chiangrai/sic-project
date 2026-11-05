package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.entity.pm.PmCustomerContract;
import com.softinter.sicapi.entity.pm.PmCustomerProject;
import com.softinter.sicapi.entity.pm.PmRequirement;
import com.softinter.sicapi.entity.pm.PmSpecification;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.repository.pm.PmCustomerProjectRepository;
import com.softinter.sicapi.repository.pm.PmDeliveryRepository;
import com.softinter.sicapi.repository.pm.PmDiagramTabRepository;
import com.softinter.sicapi.repository.pm.PmRequirementRepository;
import com.softinter.sicapi.repository.pm.PmSpecificationRepository;
import com.softinter.sicapi.repository.pm.PmTaskRepository;
import com.softinter.sicapi.repository.pm.PmTestScenarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiProjectContextHelperTest {

    @Mock private PmCustomerProjectRepository projectRepository;
    @Mock private PmCustomerContractRepository contractRepository;
    @Mock private PmRequirementRepository requirementRepository;
    @Mock private PmSpecificationRepository specificationRepository;
    @Mock private PmDiagramTabRepository diagramRepository;
    @Mock private PmTaskRepository taskRepository;
    @Mock private PmTestScenarioRepository scenarioRepository;
    @Mock private PmDeliveryRepository deliveryRepository;

    @InjectMocks
    private AiProjectContextHelper helper;

    private final UUID bizId = UUID.randomUUID();
    private final UUID projectId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        BusinessContextHolder.setBusinessId(bizId);
    }

    @AfterEach
    void tearDown() {
        BusinessContextHolder.clear();
    }

    @Test
    void buildProjectScopeBlock_includesAllProjectItemsWithIdsAndStripsHtml() {
        PmRequirement r1 = new PmRequirement();
        r1.setId(UUID.randomUUID());
        r1.setRequirementCode("REQ-001");
        r1.setTitle("ระบบจัดการสมาชิก");
        r1.setDescription("<p>ลงทะเบียนและล็อกอิน</p>");

        PmRequirement r2 = new PmRequirement();
        r2.setId(UUID.randomUUID());
        r2.setRequirementCode("REQ-002");
        r2.setTitle("ระบบชำระเงินผ่าน QR PromptPay");
        r2.setDescription("<table><tr><td>รองรับการสแกนจ่ายเงินและตรวจสอบสลิป</td></tr></table>");

        when(requirementRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(bizId, projectId))
                .thenReturn(List.of(r1, r2));

        PmCustomerProject project = new PmCustomerProject();
        project.setId(projectId);
        project.setProjectCode("PRJ-001");
        project.setProjectName("Smart E-Commerce");
        project.setDescription("<h3>รายละเอียดโครงการ</h3><p>ระบบขายของออนไลน์</p>");
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(contractRepository.findByBusinessIdAndProjectIdAndIsDeleteFalseOrderByCreatedDateDesc(bizId, projectId))
                .thenReturn(List.<PmCustomerContract>of());
        when(specificationRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(bizId, projectId))
                .thenReturn(List.<PmSpecification>of());
        when(diagramRepository.findByProjectIdAndIsDeleteFalseOrderBySortOrderAscCreatedDateAsc(projectId))
                .thenReturn(List.of());
        when(taskRepository.findByWorkPackageMilestonePhaseProjectIdAndIsDeleteFalse(projectId))
                .thenReturn(List.of());
        when(scenarioRepository.findByBusinessIdAndProjectIdAndIsDeleteFalse(bizId, projectId))
                .thenReturn(List.of());
        when(deliveryRepository.findByBusinessIdAndProjectIdAndIsDeleteFalseOrderByCreatedDateDesc(bizId, projectId))
                .thenReturn(List.of());

        String block = helper.buildProjectScopeBlock(projectId);
        assertTrue(block.contains("PRJ-001 - Smart E-Commerce"));
        assertTrue(block.contains("ID: " + r1.getId() + " | [REQ-001] ระบบจัดการสมาชิก"));
        assertTrue(block.contains("ID: " + r2.getId() + " | [REQ-002] ระบบชำระเงินผ่าน QR PromptPay"));
        assertFalse(block.contains("<table>"));
    }
}
