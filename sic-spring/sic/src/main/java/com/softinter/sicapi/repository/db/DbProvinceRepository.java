package com.softinter.sicapi.repository.db;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.db.DbProvince;

@Repository
public interface DbProvinceRepository extends JpaRepository<DbProvince, UUID>, JpaSpecificationExecutor<DbProvince> {
    Page<DbProvince> findByIsActiveTrue(Pageable pageable);
    Page<DbProvince> findByCountryIdAndIsActiveTrue(UUID countryId, Pageable pageable);
    Page<DbProvince> findByIsActiveTrueAndProvinceNameEnContainingIgnoreCase(String keyword, Pageable pageable);
    Page<DbProvince> findByCountryIdAndIsActiveTrueAndProvinceNameEnContainingIgnoreCase(UUID countryId, String keyword, Pageable pageable);
}