package com.softinter.sicapi.repository.db;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.db.DbDistrict;

@Repository
public interface DbDistrictRepository extends JpaRepository<DbDistrict, UUID>, JpaSpecificationExecutor<DbDistrict> {
    Page<DbDistrict> findByProvinceIdAndIsActiveTrue(UUID provinceId, Pageable pageable);
    Page<DbDistrict> findByProvinceIdAndIsActiveTrueAndDistrictNameEnContainingIgnoreCase(UUID provinceId, String keyword, Pageable pageable);
}