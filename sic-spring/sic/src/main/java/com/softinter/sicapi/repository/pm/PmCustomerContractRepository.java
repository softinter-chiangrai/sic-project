package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmCustomerContract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Collection;
import java.time.LocalDate;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface PmCustomerContractRepository
        extends JpaRepository<PmCustomerContract, UUID>,
                JpaSpecificationExecutor<PmCustomerContract> {

    List<PmCustomerContract> findByCustomerIdAndIsDeleteFalse(UUID customerId);

    // สำหรับ Global Search
    Page<PmCustomerContract> findByBusinessIdAndIsDeleteFalseAndContractNoContainingIgnoreCase(
            UUID businessId, String keyword, Pageable pageable);

    List<PmCustomerContract> findByBusinessIdAndIsDeleteFalseOrderByCreatedDateDesc(UUID businessId);

    List<PmCustomerContract> findByBusinessIdAndCustomerIdAndIsDeleteFalseOrderByCreatedDateDesc(UUID businessId, UUID customerId);

    long countByProjectIdAndIsDeleteFalse(UUID projectId);

    /** ฉบับต่ออายุที่ชี้มาที่สัญญานี้ */
    List<PmCustomerContract> findByParentContractIdAndIsDeleteFalse(UUID parentContractId);

    boolean existsByBusinessIdAndProjectIdAndContractNoAndIsDeleteFalse(
            UUID businessId, UUID projectId, String contractNo);

    boolean existsByContractNo(String contractNo);

    /** สัญญาที่จะหมดอายุในช่วงที่กำหนด และยังไม่ถูกต่อ/ยกเลิก */
    @Query("SELECT COUNT(c) FROM PmCustomerContract c WHERE c.businessId = :businessId " +
           "AND c.isDelete = false AND c.endDate BETWEEN :from AND :to " +
           "AND (c.renewalStatus IS NULL OR c.renewalStatus NOT IN :closed)")
    long countNearExpiry(@Param("businessId") UUID businessId,
                         @Param("closed") Collection<String> closed,
                         @Param("from") LocalDate from,
                         @Param("to") LocalDate to);

    /** สัญญาที่ลงนามแล้ว ยังไม่ถูกต่อ/ยกเลิก และจะหมดอายุภายในช่วงที่กำหนด (ใช้กับงานรายวัน ไม่แยก business) */
    @Query("SELECT c FROM PmCustomerContract c WHERE c.isDelete = false " +
           "AND LOWER(c.signStatus) = 'signed' AND c.endDate BETWEEN :from AND :to " +
           "AND (c.renewalStatus IS NULL OR c.renewalStatus NOT IN :closed) ORDER BY c.endDate ASC")
    List<PmCustomerContract> findExpiringContracts(@Param("from") LocalDate from,
                                                   @Param("to") LocalDate to,
                                                   @Param("closed") Collection<String> closed);
}