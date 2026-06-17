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

import com.softinter.sicapi.entity.db.DbSubDistrict;

@Repository
public interface DbSubDistrictRepository extends JpaRepository<DbSubDistrict, UUID>, JpaSpecificationExecutor<DbSubDistrict> {
    Page<DbSubDistrict> findByDistrictIdAndIsActiveTrue(UUID districtId, Pageable pageable);
    Page<DbSubDistrict> findByDistrictIdAndIsActiveTrueAndSubDistrictNameEnContainingIgnoreCase(UUID districtId, String keyword, Pageable pageable);
    
    @Query("SELECT s FROM DbSubDistrict s " +
           "WHERE (:districtId IS NULL OR s.district.id = :districtId) " +
           "AND s.isActive = true " +
           "ORDER BY CASE WHEN :useEnglish = true THEN s.subDistrictNameEn ELSE s.subDistrictNameLocal END")
    List<DbSubDistrict> findByDistrictIdAndIsActiveTrueOrderByName(
            @Param("districtId") UUID districtId,
            @Param("useEnglish") boolean useEnglish);
}