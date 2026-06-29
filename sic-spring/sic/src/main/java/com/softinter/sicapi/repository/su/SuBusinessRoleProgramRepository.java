package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuBusinessRoleProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SuBusinessRoleProgramRepository extends JpaRepository<SuBusinessRoleProgram, UUID>, JpaSpecificationExecutor<SuBusinessRoleProgram> {

    @Query("SELECT brp FROM SuBusinessRoleProgram brp JOIN FETCH brp.program WHERE brp.businessRole.id = :businessRoleId AND brp.isDelete = false AND brp.isActive = true")
    List<SuBusinessRoleProgram> findActiveByBusinessRoleId(@Param("businessRoleId") UUID businessRoleId);

    List<SuBusinessRoleProgram> findByBusinessRoleIdAndIsDeleteFalse(UUID businessRoleId);

     @Query("SELECT brp FROM SuBusinessRoleProgram brp " +
           "JOIN FETCH brp.businessRole " +
           "JOIN FETCH brp.program " +
           "WHERE brp.isDelete = false " +
           "AND (:businessRoleId IS NULL OR brp.businessRole.id = :businessRoleId)")
    List<SuBusinessRoleProgram> findAllWithFetch(@Param("businessRoleId") UUID businessRoleId);
}
