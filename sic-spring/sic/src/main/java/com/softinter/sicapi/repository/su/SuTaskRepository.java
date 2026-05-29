package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SuTaskRepository extends JpaRepository<SuTask, UUID> {
    List<SuTask> findByIsActiveTrueOrderBySortOrder();
}
