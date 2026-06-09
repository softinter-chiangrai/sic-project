package com.softinter.sicapi.repository.db;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.db.DbSubDistrict;

@Repository
public interface DbSubDistrictRepository extends JpaRepository<DbSubDistrict, UUID>, JpaSpecificationExecutor<DbSubDistrict> {
    Page<DbSubDistrict> findByDistrictIdAndIsActiveTrue(UUID districtId, Pageable pageable);
    Page<DbSubDistrict> findByDistrictIdAndIsActiveTrueAndSubDistrictNameEnContainingIgnoreCase(UUID districtId, String keyword, Pageable pageable);
}