package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.response.PmCustomerContractResponse;
import com.softinter.sicapi.entity.pm.PmCustomerContract;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.service.ApprovalService;
import com.softinter.sicapi.util.ContractNoHelper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class ContractRenewalTest {

    @Test
    void renewalNumbers_followTheChain() {
        assertEquals("CT-001-R1", ContractNoHelper.nextRenewalNo("CT-001"));
        assertEquals("CT-001-R2", ContractNoHelper.nextRenewalNo("CT-001-R1"));
        assertEquals("CT-001-R10", ContractNoHelper.nextRenewalNo("CT-001-r9"));
        assertEquals("", ContractNoHelper.nextRenewalNo(null));
    }

    @Test
    void renewalNumber_skipsNumbersAlreadyTaken() {
        Set<String> taken = Set.of("CT-001-R1", "CT-001-R2");
        assertEquals("CT-001-R3", ContractNoHelper.nextAvailableRenewalNo("CT-001", taken::contains));
    }

    private PmCustomerContract contract(String no, UUID id, UUID parent, LocalDate start) {
        PmCustomerContract c = new PmCustomerContract();
        c.setId(id);
        c.setContractNo(no);
        c.setParentContractId(parent);
        c.setStartDate(start);
        c.setIsDelete(false);
        return c;
    }

    /** เปิดจากฉบับไหนในสายก็ได้ผลเดียวกัน: ฉบับแรก → R1 → R2 */
    @Test
    void renewalChain_isOrderedFromFirstToLatest_fromAnyMember() {
        UUID a = UUID.randomUUID(), b = UUID.randomUUID(), c = UUID.randomUUID();
        PmCustomerContract first = contract("CT-001", a, null, LocalDate.of(2025, 1, 1));
        PmCustomerContract r1 = contract("CT-001-R1", b, a, LocalDate.of(2026, 1, 1));
        PmCustomerContract r2 = contract("CT-001-R2", c, b, LocalDate.of(2027, 1, 1));

        PmCustomerContractRepository repo = Mockito.mock(PmCustomerContractRepository.class);
        when(repo.findById(a)).thenReturn(Optional.of(first));
        when(repo.findById(b)).thenReturn(Optional.of(r1));
        when(repo.findById(c)).thenReturn(Optional.of(r2));
        when(repo.findByParentContractIdAndIsDeleteFalse(a)).thenReturn(List.of(r1));
        when(repo.findByParentContractIdAndIsDeleteFalse(b)).thenReturn(List.of(r2));
        when(repo.findByParentContractIdAndIsDeleteFalse(c)).thenReturn(List.of());

        PmCustomerContractServiceImpl service = Mockito.mock(PmCustomerContractServiceImpl.class,
                Mockito.withSettings().defaultAnswer(Mockito.CALLS_REAL_METHODS));
        ReflectionTestUtils.setField(service, "contractRepository", repo);
        ReflectionTestUtils.setField(service, "approvalService", Mockito.mock(ApprovalService.class));
        ReflectionTestUtils.setField(service, "projectRepository",
                Mockito.mock(com.softinter.sicapi.repository.pm.PmCustomerProjectRepository.class));

        for (UUID openFrom : List.of(a, b, c)) {
            List<String> nos = service.getRenewalChain(openFrom).stream()
                    .map(PmCustomerContractResponse::getContractNo).toList();
            assertEquals(List.of("CT-001", "CT-001-R1", "CT-001-R2"), nos, "เปิดจาก " + openFrom);
        }
    }
}
