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

import com.softinter.sicapi.entity.db.DbProvince;

@Repository
public interface DbProvinceRepository extends JpaRepository<DbProvince, UUID>, JpaSpecificationExecutor<DbProvince> {
    Page<DbProvince> findByIsActiveTrue(Pageable pageable);
    Page<DbProvince> findByCountryIdAndIsActiveTrue(UUID countryId, Pageable pageable);

    // ค้นหาจาก provinceNameEn หรือ provinceNameLocal (รองรับพิมพ์ค้นหาเป็นภาษาไทย)
    @Query("SELECT p FROM DbProvince p WHERE p.isActive = true " +
           "AND (:countryId IS NULL OR p.country.id = :countryId) " +
           "AND (LOWER(p.provinceNameEn) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(p.provinceNameLocal) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<DbProvince> searchByKeyword(@Param("countryId") UUID countryId, @Param("keyword") String keyword, Pageable pageable);

     @Query("SELECT p FROM DbProvince p " +
           "WHERE (:countryId IS NULL OR p.country.id = :countryId) " +
           "AND p.isActive = true " +
           "ORDER BY CASE WHEN :useEnglish = true THEN p.provinceNameEn ELSE p.provinceNameLocal END")
    List<DbProvince> findByCountryIdAndIsActiveTrueOrderByName(
            @Param("countryId") UUID countryId,
            @Param("useEnglish") boolean useEnglish);
}