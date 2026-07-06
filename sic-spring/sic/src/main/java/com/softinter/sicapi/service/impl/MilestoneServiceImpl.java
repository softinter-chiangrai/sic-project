package com.softinter.sicapi.service.impl;


import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.MilestoneRequest;
import com.softinter.sicapi.dto.response.MilestoneResponse;
import com.softinter.sicapi.entity.pm.PmMilestone;
import com.softinter.sicapi.entity.pm.PmPhase;
import com.softinter.sicapi.repository.pm.PmMilestoneRepository;
import com.softinter.sicapi.repository.pm.PmPhaseRepository;
import com.softinter.sicapi.service.MilestoneService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MilestoneServiceImpl implements MilestoneService {

    private final PmMilestoneRepository milestoneRepository;
    private final PmPhaseRepository phaseRepository;

    @Override
    public List<MilestoneResponse> getMilestonesByPhaseId(UUID phaseId) {
        return milestoneRepository.findByPhaseIdAndIsDeleteFalseOrderByDueDateAsc(phaseId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public MilestoneResponse getMilestoneById(UUID milestoneId) {
        PmMilestone ms = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));
        return toResponse(ms);
    }

    @Override
    @Transactional
    public MilestoneResponse createMilestone(MilestoneRequest request) {
        PmPhase phase = phaseRepository.findById(request.getPhaseId())
                .orElseThrow(() -> new RuntimeException("Phase not found"));

        PmMilestone ms = new PmMilestone();
        ms.setPhase(phase);
        ms.setMilestoneName(request.getMilestoneName());
        ms.setDescription(request.getDescription());
        ms.setDueDate(request.getDueDate());  
        ms.setStatus("Not Started");

        ms = milestoneRepository.save(ms);
        return toResponse(ms);
    }

    @Override
    @Transactional
    public MilestoneResponse updateMilestone(UUID milestoneId, MilestoneRequest request) {
        PmMilestone ms = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        ms.setMilestoneName(request.getMilestoneName());
        ms.setDescription(request.getDescription());
        ms.setDueDate(request.getDueDate());

        ms = milestoneRepository.save(ms);
        return toResponse(ms);
    }

    @Override
    @Transactional
    public void deleteMilestone(UUID milestoneId) {
        PmMilestone ms = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));
        ms.setIsDelete(true);
        milestoneRepository.save(ms);
    }

    private MilestoneResponse toResponse(PmMilestone ms) {
        MilestoneResponse dto = new MilestoneResponse();
        dto.setId(ms.getId());
        dto.setPhaseId(ms.getPhase().getId());
        dto.setPhaseName(ms.getPhase().getPhaseName());
        dto.setMilestoneName(ms.getMilestoneName());
        dto.setDescription(ms.getDescription());
        dto.setDueDate(ms.getDueDate());
        dto.setStatus(ms.getStatus());
        return dto;
    }
}