package com.softinter.sicapi.repository.db;

import com.softinter.sicapi.entity.db.DbProvince;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DbProvinceRepository extends JpaRepository<DbProvince, UUID> {
    List<DbProvince> findByCountryIdAndIsActiveTrueOrderByProvinceNameEn(UUID countryId);
    List<DbProvince> findByIsActiveTrueOrderByProvinceNameEn();
}
