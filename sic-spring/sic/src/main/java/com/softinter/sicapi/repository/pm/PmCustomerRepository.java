package com.softinter.sicapi.repository.pm;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.pm.PmCustomer;

@Repository
public interface PmCustomerRepository extends JpaRepository<PmCustomer, UUID> {

    Optional<PmCustomer> findByBusinessIdAndCustomerCode(UUID businessId, String customerCode);

    List<PmCustomer> findByBusinessIdAndIsActiveTrue(UUID businessId);

    Page<PmCustomer> findByBusinessIdAndIsActiveTrue(UUID businessId, Pageable pageable);

    @Query("SELECT c FROM PmCustomer c WHERE c.businessId = :businessId " +
           "AND c.isDelete = false " +
           "AND (LOWER(c.companyNameEn) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.companyNameLocal) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.customerCode) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<PmCustomer> searchByKeyword(@Param("businessId") UUID businessId,
                                     @Param("keyword") String keyword,
                                     Pageable pageable);

    Optional<PmCustomer> findByIdAndBusinessId(UUID id, UUID businessId);

    @Query("SELECT c FROM PmCustomer c " +
           "LEFT JOIN FETCH c.province p " +
           "LEFT JOIN FETCH p.country " +
           "LEFT JOIN FETCH c.district " +
           "LEFT JOIN FETCH c.subDistrict " +
           "WHERE c.businessId = :businessId AND c.isDelete = false AND c.isActive = true")
    Page<PmCustomer> findByBusinessIdAndIsActiveTrueWithFetch(@Param("businessId") UUID businessId,
                                                               Pageable pageable);

    @Query("SELECT c FROM PmCustomer c " +
           "LEFT JOIN FETCH c.province p " +
           "LEFT JOIN FETCH p.country " +
           "LEFT JOIN FETCH c.district " +
           "LEFT JOIN FETCH c.subDistrict " +
           "WHERE c.businessId = :businessId AND c.isDelete = false " +
           "AND (LOWER(c.companyNameEn) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.companyNameLocal) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.customerCode) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<PmCustomer> searchByKeywordWithFetch(@Param("businessId") UUID businessId,
                                              @Param("keyword") String keyword,
                                              Pageable pageable);
}