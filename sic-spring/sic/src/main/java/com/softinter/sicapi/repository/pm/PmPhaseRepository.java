package com.softinter.sicapi.repository.pm;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.pm.PmPhase;

@Repository
public interface PmPhaseRepository extends JpaRepository<PmPhase, UUID> {
    List<PmPhase> findByProjectIdAndIsDeleteFalseOrderByStartDateAsc(UUID projectId);
}
