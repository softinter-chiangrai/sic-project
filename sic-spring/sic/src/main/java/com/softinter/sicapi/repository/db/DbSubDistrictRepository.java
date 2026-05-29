package com.softinter.sicapi.repository.db;

import com.softinter.sicapi.entity.db.DbSubDistrict;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DbSubDistrictRepository extends JpaRepository<DbSubDistrict, UUID> {
    List<DbSubDistrict> findByDistrictIdAndIsActiveTrueOrderBySubDistrictNameEn(UUID districtId);
}
