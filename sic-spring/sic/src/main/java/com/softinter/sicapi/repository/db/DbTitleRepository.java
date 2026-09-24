package com.softinter.sicapi.repository.db;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.db.DbTitle;

@Repository
public interface DbTitleRepository extends JpaRepository<DbTitle, UUID>, JpaSpecificationExecutor<DbTitle> {
    Page<DbTitle> findByIsActiveTrue(Pageable pageable);
    Page<DbTitle> findByIsActiveTrueAndPersonType(String personType, Pageable pageable);

    List<DbTitle> findByPersonTypeAndIsActiveTrue(String personType);

    // ค้นหาจาก prefixNameEn หรือ prefixNameLocal (รองรับพิมพ์ค้นหาเป็นภาษาไทย)
    @Query("SELECT t FROM DbTitle t WHERE t.isActive = true " +
           "AND (:personType IS NULL OR t.personType = :personType) " +
           "AND (LOWER(t.prefixNameEn) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(t.prefixNameLocal) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<DbTitle> searchByKeyword(@Param("personType") String personType, @Param("keyword") String keyword, Pageable pageable);
}