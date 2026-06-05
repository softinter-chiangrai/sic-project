package com.softinter.sicapi.repository.db;

import com.softinter.sicapi.entity.db.DbParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface DbParameterRepository extends JpaRepository<DbParameter, UUID> {
    
    // ✅ ใช้ moduleCode ตาม Entity
    List<DbParameter> findByModuleCodeAndIsActiveTrueOrderBySortOrder(String moduleCode);
    
    // หรือใช้ @Query ก็ได้
    @Query("SELECT p FROM DbParameter p " +
           "WHERE p.moduleCode = :moduleCode " +
           "AND p.isActive = true " +
           "ORDER BY p.sortOrder ASC")
    List<DbParameter> findActiveByModuleCode(@Param("moduleCode") String moduleCode);
}