package com.softinter.sicapi.repository.pm;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.softinter.sicapi.entity.pm.PmTaskAssignee;



public interface PmTaskAssigneeRepository extends JpaRepository<PmTaskAssignee, UUID> {
    List<PmTaskAssignee> findByTaskId(UUID taskId);
    void deleteByTaskId(UUID taskId);
}
