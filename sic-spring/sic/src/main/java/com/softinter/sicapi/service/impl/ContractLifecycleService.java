package com.softinter.sicapi.service.impl;

import com.softinter.sicapi.dto.request.PmCustomerContractRequest;
import com.softinter.sicapi.entity.pm.PmCustomerContract;
import com.softinter.sicapi.repository.pm.PmCustomerContractRepository;
import com.softinter.sicapi.service.ApprovalNotificationService;
import com.softinter.sicapi.service.PmCustomerContractService;
import com.softinter.sicapi.util.ContractLifecycle;
import com.softinter.sicapi.util.ContractNoHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * งานรายวันของสัญญา: เตือนก่อนหมดอายุ (90/60/30/7 วัน) และสร้างฉบับต่ออายุ (ร่าง) ให้สัญญาที่ตั้ง "ต่ออัตโนมัติ"
 * ponytail: เตือนเฉพาะวันที่เหลือตรงกับเกณฑ์พอดี ถ้างานไม่ได้รันวันนั้นจะข้ามการเตือนรอบนั้น
 * (ต้องกันซ้ำจริงให้เก็บ lastReminderDays ในสัญญา) และรันบนเครื่องเดียว ถ้าขยายหลาย instance ต้องมี lock
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContractLifecycleService {

    static final Set<Integer> REMINDER_DAYS = Set.of(90, 60, 30, 7);
    static final int MAX_LOOKAHEAD_DAYS = 90;
    static final int AUTO_RENEW_DAYS = 30;
    private static final Set<String> CLOSED = Set.of(ContractLifecycle.RENEWAL_STATUS_RENEWED, ContractLifecycle.RENEWAL_STATUS_CANCELLED);

    private final PmCustomerContractRepository contractRepository;
    private final PmCustomerContractService contractService;
    private final ApprovalNotificationService notificationService;

    @Transactional
    public void runDaily(LocalDate today) {
        List<PmCustomerContract> expiring = contractRepository.findExpiringContracts(
                today, today.plusDays(MAX_LOOKAHEAD_DAYS), CLOSED);
        for (PmCustomerContract c : expiring) {
            try {
                process(c, today);
            } catch (Exception e) {
                log.error("Contract lifecycle failed for {}: {}", c.getContractNo(), e.getMessage(), e);
            }
        }
        log.info("Contract lifecycle job: checked {} expiring contract(s)", expiring.size());
    }

    private void process(PmCustomerContract c, LocalDate today) {
        int days = (int) ChronoUnit.DAYS.between(today, c.getEndDate());

        if (REMINDER_DAYS.contains(days)) {
            notify(c, "สัญญา " + c.getContractNo() + " ใกล้หมดอายุ",
                    "สัญญา " + c.getContractNo() + " จะหมดอายุในอีก " + days + " วัน (" + c.getEndDate() + ")", c.getId());
        }

        if (Boolean.TRUE.equals(c.getAutoRenew()) && days <= AUTO_RENEW_DAYS && !hasActiveRenewal(c)) {
            UUID newId = contractService.saveContract(c.getBusinessId(), renewalDraft(c));
            notify(c, "สร้างฉบับต่ออายุอัตโนมัติ",
                    "ระบบสร้างฉบับต่ออายุ (ร่าง) ของสัญญา " + c.getContractNo() + " ให้แล้ว กรุณาตรวจสอบและส่งอนุมัติ", newId);
        }
    }

    private boolean hasActiveRenewal(PmCustomerContract c) {
        return contractRepository.findByParentContractIdAndIsDeleteFalse(c.getId()).stream()
                .anyMatch(r -> !ContractLifecycle.RENEWAL_STATUS_CANCELLED.equals(r.getRenewalStatus()));
    }

    /** ฉบับต่ออายุแบบร่าง: เริ่มวันถัดจากวันหมดอายุ ต่อ 1 ปี มูลค่าและเงื่อนไขเดิม (ผู้ใช้ตรวจแก้ก่อนส่งอนุมัติ) */
    static PmCustomerContractRequest renewalDraft(PmCustomerContract c) {
        PmCustomerContractRequest r = new PmCustomerContractRequest();
        r.setCustomerId(c.getCustomerId());
        r.setProjectId(c.getProjectId());
        r.setContractNo(ContractNoHelper.nextRenewalNo(c.getContractNo()));
        r.setContractType(c.getContractType());
        r.setStartDate(c.getEndDate().plusDays(1));
        r.setEndDate(c.getEndDate().plusDays(1).plusYears(1));
        r.setContractValue(c.getContractValue());
        r.setPaymentTerms(c.getPaymentTerms());
        r.setScopeSummary(c.getScopeSummary());
        r.setSignStatus("Draft");
        r.setParentContractId(c.getId());
        r.setAutoRenew(c.getAutoRenew());
        r.setIsActive(true);
        return r;
    }

    private void notify(PmCustomerContract c, String title, String message, UUID linkContractId) {
        String owner = c.getCreatedBy();
        if (owner == null || owner.isBlank() || "system".equalsIgnoreCase(owner)) {
            return;
        }
        notificationService.notifyUser(c.getBusinessId(), owner, title, message, "CONTRACT",
                "/feature/pm/contract/" + linkContractId + "/view");
    }
}
