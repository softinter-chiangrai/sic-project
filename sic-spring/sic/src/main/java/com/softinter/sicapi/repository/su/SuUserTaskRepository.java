package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuUserTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SuUserTaskRepository extends JpaRepository<SuUserTask, UUID>, JpaSpecificationExecutor<SuUserTask> {
    List<SuUserTask> findByBusinessIdAndIsDeleteFalse(UUID businessId);
    
    // ✅ ค้นหาตาม taskId และ businessId
    List<SuUserTask> findByTaskIdAndBusinessIdAndIsDeleteFalse(UUID taskId, UUID businessId);
    
    // ✅ หรือใช้ @Query ถ้าต้องการ join กับ task
    @Query("SELECT ut FROM SuUserTask ut WHERE ut.businessId = :businessId AND ut.isDelete = false")
    List<SuUserTask> findAllByBusinessId(@Param("businessId") UUID businessId);
}
