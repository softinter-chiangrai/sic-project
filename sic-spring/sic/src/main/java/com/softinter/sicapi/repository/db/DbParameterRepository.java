package com.softinter.sicapi.repository.db;

import com.softinter.sicapi.entity.db.DbParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface DbParameterRepository extends JpaRepository<DbParameter, UUID> {
    
    // ✅ ตาม moduleCode เท่านั้น
    List<DbParameter> findByModuleCodeAndIsActiveTrueOrderBySortOrder(String moduleCode);

    // ✅ ตาม moduleCode + parameterCode (ใช้สำหรับ PERSON_TYPE)
    @Query("SELECT p FROM DbParameter p " +
           "WHERE p.moduleCode = :moduleCode " +
           "AND p.parameterCode = :parameterCode " +
           "AND p.isActive = true " +
           "ORDER BY p.sortOrder ASC")
    List<DbParameter> findByModuleCodeAndParameterCodeAndIsActiveTrueOrderBySortOrder(
            @Param("moduleCode") String moduleCode,
            @Param("parameterCode") String parameterCode);

    // (Optional) ตาม moduleCode ด้วย @Query
    @Query("SELECT p FROM DbParameter p " +
           "WHERE p.moduleCode = :moduleCode " +
           "AND p.isActive = true " +
           "ORDER BY p.sortOrder ASC")
    List<DbParameter> findActiveByModuleCode(@Param("moduleCode") String moduleCode);
}