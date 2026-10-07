package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmCustomerContract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

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
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM PmCustomerContract c WHERE c.businessId = :businessId " +
           "AND c.isDelete = false AND c.endDate BETWEEN :from AND :to " +
           "AND (c.renewalStatus IS NULL OR c.renewalStatus NOT IN :closed)")
    long countNearExpiry(@org.springframework.data.repository.query.Param("businessId") UUID businessId,
                         @org.springframework.data.repository.query.Param("closed") java.util.Collection<String> closed,
                         @org.springframework.data.repository.query.Param("from") java.time.LocalDate from,
                         @org.springframework.data.repository.query.Param("to") java.time.LocalDate to);
}