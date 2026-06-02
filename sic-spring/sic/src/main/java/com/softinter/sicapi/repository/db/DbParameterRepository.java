package com.softinter.sicapi.repository.db;

import com.softinter.sicapi.entity.db.DbParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DbParameterRepository extends JpaRepository<DbParameter, UUID> {
    
    // เปลี่ยนจาก paramGroup เป็น moduleCode
    List<DbParameter> findByModuleCodeAndIsActiveTrueOrderBySortOrder(String moduleCode);
    
    // เปลี่ยนจาก paramGroup และ paramCode เป็น moduleCode และ parameterCode
    Optional<DbParameter> findByModuleCodeAndParameterCodeAndIsActiveTrue(String moduleCode, String parameterCode);
}