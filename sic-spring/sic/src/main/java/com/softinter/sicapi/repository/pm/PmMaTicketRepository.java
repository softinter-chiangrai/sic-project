package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmMaTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmMaTicketRepository extends JpaRepository<PmMaTicket, UUID>, JpaSpecificationExecutor<PmMaTicket> {
    Optional<PmMaTicket> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);
    Page<PmMaTicket> findByBusinessIdAndIsDeleteFalse(UUID businessId, Pageable pageable);
    Page<PmMaTicket> findByBusinessIdAndProjectIdAndIsDeleteFalse(UUID businessId, UUID projectId, Pageable pageable);
}
