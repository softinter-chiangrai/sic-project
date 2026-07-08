package com.softinter.sicapi.service.impl;


import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softinter.sicapi.dto.request.WorkPackageRequest;
import com.softinter.sicapi.dto.response.WorkPackageResponse;
import com.softinter.sicapi.entity.pm.PmMilestone;
import com.softinter.sicapi.entity.pm.PmWorkPackage;
import com.softinter.sicapi.repository.pm.PmMilestoneRepository;
import com.softinter.sicapi.repository.pm.PmWorkPackageRepository;
import com.softinter.sicapi.service.WorkPackageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkPackageServiceImpl implements WorkPackageService {

    private final PmWorkPackageRepository wpRepository;
    private final PmMilestoneRepository milestoneRepository;

    @Transactional(readOnly = true)
    @Override
    public List<WorkPackageResponse> getWorkPackagesByMilestoneId(UUID milestoneId) {
        return wpRepository.findByMilestoneIdAndIsDeleteFalse(milestoneId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    @Override
    public WorkPackageResponse getWorkPackageById(UUID wpId) {
        PmWorkPackage wp = wpRepository.findById(wpId)
                .orElseThrow(() -> new RuntimeException("Work Package not found"));
        return toResponse(wp);
    }

    @Override
    @Transactional
    public WorkPackageResponse createWorkPackage(WorkPackageRequest request) {
        PmMilestone ms = milestoneRepository.findById(request.getMilestoneId())
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        PmWorkPackage wp = new PmWorkPackage();
        wp.setMilestone(ms);
        wp.setPackageName(request.getPackageName());
        wp.setDescription(request.getDescription());
        wp.setStartDate(request.getStartDate());
        wp.setEndDate(request.getEndDate());
        wp.setStatus("Not Started");
        wp.setColor(request.getColor());

        wp = wpRepository.save(wp);
        return toResponse(wp);
    }

    @Override
    @Transactional
    public WorkPackageResponse updateWorkPackage(UUID wpId, WorkPackageRequest request) {
        PmWorkPackage wp = wpRepository.findById(wpId)
                .orElseThrow(() -> new RuntimeException("Work Package not found"));

        wp.setPackageName(request.getPackageName());
        wp.setDescription(request.getDescription());
        wp.setStartDate(request.getStartDate());
        wp.setEndDate(request.getEndDate());
        wp.setColor(request.getColor());

        wp = wpRepository.save(wp);
        return toResponse(wp);
    }

    @Override
    @Transactional
    public void deleteWorkPackage(UUID wpId) {
        PmWorkPackage wp = wpRepository.findById(wpId)
                .orElseThrow(() -> new RuntimeException("Work Package not found"));
        wp.setIsDelete(true);
        wpRepository.save(wp);
    }

    private WorkPackageResponse toResponse(PmWorkPackage wp) {
        WorkPackageResponse dto = new WorkPackageResponse();
        dto.setId(wp.getId());
        dto.setMilestoneId(wp.getMilestone().getId());
        dto.setMilestoneName(wp.getMilestone().getMilestoneName());
        dto.setPackageName(wp.getPackageName());
        dto.setDescription(wp.getDescription());
        dto.setStartDate(wp.getStartDate());
        dto.setEndDate(wp.getEndDate());
        dto.setStatus(wp.getStatus());
        dto.setColor(wp.getColor());
        return dto;
    }
}