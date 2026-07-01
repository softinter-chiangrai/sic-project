package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuCustomer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuCustomerRepository extends JpaRepository<SuCustomer, UUID> {

    Optional<SuCustomer> findByBusinessIdAndCustomerCode(UUID businessId, String customerCode);

    List<SuCustomer> findByBusinessIdAndIsActiveTrue(UUID businessId);

    Page<SuCustomer> findByBusinessIdAndIsActiveTrue(UUID businessId, Pageable pageable);

    @Query("SELECT c FROM SuCustomer c WHERE c.businessId = :businessId " +
           "AND c.isDelete = false " +
           "AND (LOWER(c.companyNameEn) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.companyNameLocal) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.customerCode) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<SuCustomer> searchByKeyword(@Param("businessId") UUID businessId,
                                     @Param("keyword") String keyword,
                                     Pageable pageable);

    Optional<SuCustomer> findByIdAndBusinessId(UUID id, UUID businessId);

    @Query("SELECT c FROM SuCustomer c " +
           "LEFT JOIN FETCH c.province p " +
           "LEFT JOIN FETCH p.country " +
           "LEFT JOIN FETCH c.district " +
           "LEFT JOIN FETCH c.subDistrict " +
           "WHERE c.businessId = :businessId AND c.isDelete = false AND c.isActive = true")
    Page<SuCustomer> findByBusinessIdAndIsActiveTrueWithFetch(@Param("businessId") UUID businessId,
                                                               Pageable pageable);

    @Query("SELECT c FROM SuCustomer c " +
           "LEFT JOIN FETCH c.province p " +
           "LEFT JOIN FETCH p.country " +
           "LEFT JOIN FETCH c.district " +
           "LEFT JOIN FETCH c.subDistrict " +
           "WHERE c.businessId = :businessId AND c.isDelete = false " +
           "AND (LOWER(c.companyNameEn) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.companyNameLocal) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.customerCode) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<SuCustomer> searchByKeywordWithFetch(@Param("businessId") UUID businessId,
                                              @Param("keyword") String keyword,
                                              Pageable pageable);
}