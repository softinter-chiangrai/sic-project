// src/main/java/com/softinter/sicapi/repository/pm/PmRequirementChangeRequestRepository.java
package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmRequirementChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PmRequirementChangeRequestRepository 
        extends JpaRepository<PmRequirementChangeRequest, UUID>, 
                JpaSpecificationExecutor<PmRequirementChangeRequest> {
}