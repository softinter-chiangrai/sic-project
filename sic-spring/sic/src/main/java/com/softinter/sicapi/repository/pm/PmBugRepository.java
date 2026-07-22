package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmBug;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmBugRepository extends JpaRepository<PmBug, UUID> {

    Page<PmBug> findByBusinessIdAndIsDeleteFalse(UUID businessId, Pageable pageable);

    Optional<PmBug> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);
}