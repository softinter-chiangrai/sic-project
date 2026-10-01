package com.softinter.sicapi.service.impl;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Component;

import com.softinter.sicapi.config.BusinessContextHolder;
import com.softinter.sicapi.repository.su.SuProfileRepository;
import com.softinter.sicapi.repository.su.SuUserBusinessRepository;
import com.softinter.sicapi.util.LocalizationHelper;

import lombok.RequiredArgsConstructor;

/** สุ่มสมาชิก active ของ business ปัจจุบัน ใช้เติม owner/assignee/tester ให้ draft ของ AI รายหน้า */
@Component
@RequiredArgsConstructor
public class AiMemberPicker {

    public record Member(String userId, String name) {
    }

    private final SuUserBusinessRepository userBusinessRepository;
    private final SuProfileRepository profileRepository;

    /** คืน null ถ้า business ไม่มีสมาชิกหรือไม่รู้ business */
    public Member pick() {
        if (BusinessContextHolder.getBusinessId() == null) return null;
        List<String> ids = userBusinessRepository.findByBusinessIdAndIsActiveTrue(BusinessContextHolder.getBusinessId())
                .stream().map(ub -> ub.getUserId()).toList();
        if (ids.isEmpty()) return null;
        String userId = ids.get(ThreadLocalRandom.current().nextInt(ids.size()));
        String name = profileRepository.findByUserId(userId).map(LocalizationHelper::getFullName)
                .filter(n -> n != null && !n.isBlank()).orElse(userId);
        return new Member(userId, name);
    }
}
