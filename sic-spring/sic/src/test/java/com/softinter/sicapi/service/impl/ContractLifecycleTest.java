package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmCustomerContractRequest;
import com.softinter.sicapi.entity.pm.PmCustomerContract;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.service.ApprovalNotificationService;
import com.softinter.sicapi.service.PmCustomerContractService;
import com.softinter.sicapi.util.ContractLifecycle;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ContractLifecycleTest {

    static final LocalDate TODAY = LocalDate.of(2026, 10, 7);

    @Test
    void status_isDerivedFromDatesAndRenewalStatus() {
        assertEquals("ACTIVE", ContractLifecycle.status("Signed", null, TODAY.plusDays(200), TODAY));
        assertEquals("EXPIRING", ContractLifecycle.status("Signed", null, TODAY.plusDays(60), TODAY));
        assertEquals("EXPIRING", ContractLifecycle.status("signed", null, TODAY, TODAY));
        assertEquals("EXPIRED", ContractLifecycle.status("Signed", null, TODAY.minusDays(1), TODAY));
        assertEquals("RENEWED", ContractLifecycle.status("Signed", "ต่อแล้ว", TODAY.minusDays(10), TODAY));
        assertEquals("CANCELLED", ContractLifecycle.status("Signed", "ยกเลิก", TODAY.plusDays(100), TODAY));
        assertEquals("DRAFT", ContractLifecycle.status("Draft", null, TODAY.plusDays(5), TODAY));
        assertEquals("ACTIVE", ContractLifecycle.status("Signed", null, null, TODAY));
        assertEquals(-3, ContractLifecycle.daysUntilExpiry(TODAY.minusDays(3), TODAY));
    }

    private PmCustomerContract contract(int daysLeft, boolean autoRenew) {
        PmCustomerContract c = new PmCustomerContract();
        c.setId(UUID.randomUUID());
        c.setBusinessId(UUID.randomUUID());
        c.setContractNo("MA-001");
        c.setContractType("Maintenance Contract");
        c.setSignStatus("Signed");
        c.setEndDate(TODAY.plusDays(daysLeft));
        c.setStartDate(TODAY.plusDays(daysLeft).minusYears(1));
        c.setContractValue(new BigDecimal("120000"));
        c.setAutoRenew(autoRenew);
        c.setCreatedBy("user-1");
        return c;
    }

    private record Fixture(ContractLifecycleService service, PmCustomerContractRepository repo,
                           PmCustomerContractService contractService, ApprovalNotificationService notifier) {
    }

    private Fixture fixture(PmCustomerContract... contracts) {
        PmCustomerContractRepository repo = Mockito.mock(PmCustomerContractRepository.class);
        PmCustomerContractService contractService = Mockito.mock(PmCustomerContractService.class);
        ApprovalNotificationService notify = Mockito.mock(ApprovalNotificationService.class);
        when(repo.findExpiringContracts(any(), any(), any())).thenReturn(List.of(contracts));
        when(repo.findByParentContractIdAndIsDeleteFalse(any())).thenReturn(List.of());
        when(contractService.saveContract(any(), any())).thenReturn(UUID.randomUUID());
        return new Fixture(new ContractLifecycleService(repo, contractService, notify), repo, contractService, notify);
    }

    @Test
    void reminder_sentOnlyOnThresholdDays() {
        PmCustomerContract at30 = contract(30, false);
        PmCustomerContract at45 = contract(45, false);
        Fixture f = fixture(at30, at45);

        f.service().runDaily(TODAY);

        verify(f.notifier()).notifyUser(eq(at30.getBusinessId()), eq("user-1"), any(), any(), eq("CONTRACT"), any());
        verify(f.notifier(), Mockito.times(1)).notifyUser(any(), any(), any(), any(), any(), any());
    }

    @Test
    void autoRenew_createsDraftRenewalWithin30Days_once() {
        PmCustomerContract c = contract(20, true);
        Fixture f = fixture(c);

        f.service().runDaily(TODAY);

        ArgumentCaptor<PmCustomerContractRequest> req = ArgumentCaptor.forClass(PmCustomerContractRequest.class);
        verify(f.contractService()).saveContract(eq(c.getBusinessId()), req.capture());
        PmCustomerContractRequest r = req.getValue();
        assertEquals("MA-001-R1", r.getContractNo());
        assertEquals(c.getId(), r.getParentContractId());
        assertEquals("Draft", r.getSignStatus());
        assertEquals(c.getEndDate().plusDays(1), r.getStartDate());
        assertEquals(c.getEndDate().plusDays(1).plusYears(1), r.getEndDate());
        assertEquals(new BigDecimal("120000"), r.getContractValue());
        assertTrue(r.getAutoRenew());
    }

    @Test
    void autoRenew_skipsWhenAlreadyRenewedOrNotDueOrOff() {
        PmCustomerContract farAway = contract(80, true);
        PmCustomerContract off = contract(10, false);
        PmCustomerContract hasRenewal = contract(10, true);
        Fixture f = fixture(farAway, off, hasRenewal);
        PmCustomerContract child = contract(400, false);
        when(f.repo().findByParentContractIdAndIsDeleteFalse(hasRenewal.getId())).thenReturn(List.of(child));

        f.service().runDaily(TODAY);

        verify(f.contractService(), never()).saveContract(any(), any());
    }

    @Test
    void closedStatuses_matchTheLifecycleConstants() {
        assertEquals(Set.of("ต่อแล้ว", "ยกเลิก"), Set.of(ContractLifecycle.RENEWAL_STATUS_RENEWED, ContractLifecycle.RENEWAL_STATUS_CANCELLED));
    }
}
