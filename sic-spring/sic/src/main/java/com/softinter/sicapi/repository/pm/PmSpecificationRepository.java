// src/main/java/com/softinter/sicapi/repository/pm/PmSpecificationRepository.java
package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmSpecification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmSpecificationRepository extends JpaRepository<PmSpecification, UUID> {
    List<PmSpecification> findByRequirementId(UUID requirementId);
}