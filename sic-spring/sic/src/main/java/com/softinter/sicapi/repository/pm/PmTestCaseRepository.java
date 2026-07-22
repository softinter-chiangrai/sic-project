package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmTestCase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmTestCaseRepository extends JpaRepository<PmTestCase, UUID> {

    Page<PmTestCase> findByBusinessIdAndIsDeleteFalse(UUID businessId, Pageable pageable);

    Optional<PmTestCase> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);
}