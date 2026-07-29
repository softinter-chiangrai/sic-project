package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmSpecificationValidation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmSpecificationValidationRepository extends JpaRepository<PmSpecificationValidation, UUID> {
    List<PmSpecificationValidation> findBySpecificationIdAndIsDeleteFalse(UUID specificationId);
    void deleteBySpecificationIdAndIsDeleteFalse(UUID specificationId);
}