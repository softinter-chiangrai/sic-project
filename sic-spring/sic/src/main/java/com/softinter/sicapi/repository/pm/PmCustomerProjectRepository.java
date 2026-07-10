package com.softinter.sicapi.repository.pm;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.pm.PmCustomerProject;

@Repository
public interface PmCustomerProjectRepository extends JpaRepository<PmCustomerProject, UUID>, JpaSpecificationExecutor<PmCustomerProject> {

    Page<PmCustomerProject> findByCustomerIdAndIsDeleteFalse(UUID customerId, Pageable pageable);

    Page<PmCustomerProject> findByCustomerIdAndBusinessIdAndIsDeleteFalse(UUID customerId, UUID businessId, Pageable pageable);

    List<PmCustomerProject> findByCustomerIdAndIsActiveTrueAndIsDeleteFalse(UUID customerId);

    Optional<PmCustomerProject> findByIdAndIsDeleteFalse(UUID id);

    Page<PmCustomerProject> findByCustomerIdAndIsDeleteFalseAndProjectNameContainingIgnoreCase(UUID customerId, String keyword, Pageable pageable);

    // สำหรับค้นหาด้วย keyword + businessId
    Page<PmCustomerProject> findByCustomerIdAndBusinessIdAndIsDeleteFalseAndProjectNameContainingIgnoreCase(UUID customerId, UUID businessId, String keyword, Pageable pageable);

    @Query("SELECT p FROM PmCustomerProject p " +
       "JOIN FETCH p.customer c " +
       "WHERE p.customerId = :customerId AND p.businessId = :businessId AND p.isDelete = false")
Page<PmCustomerProject> findByCustomerIdAndBusinessIdWithCustomer(@Param("customerId") UUID customerId, 
                                                                  @Param("businessId") UUID businessId, 
                                                                  Pageable pageable);

    List<PmCustomerProject> findByContractIdAndIsDeleteFalse(UUID contractId);

    @Query("SELECT p FROM PmCustomerProject p WHERE p.businessId = :businessId AND p.isDelete = false AND p.isActive = true")
List<PmCustomerProject> findByBusinessIdAndIsDeleteFalse(@Param("businessId") UUID businessId);

}