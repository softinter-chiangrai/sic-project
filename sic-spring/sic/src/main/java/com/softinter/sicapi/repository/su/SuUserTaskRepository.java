package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuUserTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SuUserTaskRepository extends JpaRepository<SuUserTask, UUID>, JpaSpecificationExecutor<SuUserTask> {
    List<SuUserTask> findByUserIdAndBusinessIdAndIsActiveTrue(String userId, UUID businessId);
}
