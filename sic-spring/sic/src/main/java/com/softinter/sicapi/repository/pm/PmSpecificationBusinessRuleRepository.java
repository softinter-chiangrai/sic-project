package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmSpecificationBusinessRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmSpecificationBusinessRuleRepository extends JpaRepository<PmSpecificationBusinessRule, UUID> {
    List<PmSpecificationBusinessRule> findBySpecificationIdAndIsDeleteFalse(UUID specificationId);
    void deleteBySpecificationIdAndIsDeleteFalse(UUID specificationId);
}