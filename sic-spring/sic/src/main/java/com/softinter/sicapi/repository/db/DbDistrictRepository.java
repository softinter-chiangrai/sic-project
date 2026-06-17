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

import com.softinter.sicapi.entity.db.DbDistrict;

@Repository
public interface DbDistrictRepository extends JpaRepository<DbDistrict, UUID>, JpaSpecificationExecutor<DbDistrict> {
    Page<DbDistrict> findByProvinceIdAndIsActiveTrue(UUID provinceId, Pageable pageable);
    Page<DbDistrict> findByProvinceIdAndIsActiveTrueAndDistrictNameEnContainingIgnoreCase(UUID provinceId, String keyword, Pageable pageable);

     @Query("SELECT d FROM DbDistrict d " +
           "WHERE (:provinceId IS NULL OR d.province.id = :provinceId) " +
           "AND d.isActive = true " +
           "ORDER BY CASE WHEN :useEnglish = true THEN d.districtNameEn ELSE d.districtNameLocal END")
    List<DbDistrict> findByProvinceIdAndIsActiveTrueOrderByName(
            @Param("provinceId") UUID provinceId,
            @Param("useEnglish") boolean useEnglish);
}