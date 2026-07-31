package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmCrAssignee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PmCrAssigneeRepository extends JpaRepository<PmCrAssignee, UUID> {
    List<PmCrAssignee> findByChangeRequestIdAndIsDeleteFalse(UUID changeRequestId);
    Optional<PmCrAssignee> findByUserIdAndChangeRequestIdAndIsDeleteFalse(String userId, UUID changeRequestId);
    List<PmCrAssignee> findByChangeRequestIdAndStatusAndIsDeleteFalse(UUID changeRequestId, String status);
}
