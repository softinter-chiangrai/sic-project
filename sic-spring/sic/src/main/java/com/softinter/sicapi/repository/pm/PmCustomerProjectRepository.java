package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmCustomerProject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmCustomerProjectRepository extends JpaRepository<PmCustomerProject, UUID>, JpaSpecificationExecutor<PmCustomerProject> {

    Page<PmCustomerProject> findByCustomerIdAndIsDeleteFalse(UUID customerId, Pageable pageable);

    Page<PmCustomerProject> findByCustomerIdAndBusinessIdAndIsDeleteFalse(UUID customerId, UUID businessId, Pageable pageable);

    List<PmCustomerProject> findByCustomerIdAndIsActiveTrueAndIsDeleteFalse(UUID customerId);

    Optional<PmCustomerProject> findByIdAndIsDeleteFalse(UUID id);

    Page<PmCustomerProject> findByCustomerIdAndIsDeleteFalseAndProjectNameContainingIgnoreCase(UUID customerId, String keyword, Pageable pageable);

    // สำหรับค้นหาด้วย keyword + businessId
    Page<PmCustomerProject> findByCustomerIdAndBusinessIdAndIsDeleteFalseAndProjectNameContainingIgnoreCase(UUID customerId, UUID businessId, String keyword, Pageable pageable);
}