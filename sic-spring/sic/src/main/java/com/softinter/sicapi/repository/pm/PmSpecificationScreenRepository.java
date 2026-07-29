package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmSpecificationScreen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmSpecificationScreenRepository extends JpaRepository<PmSpecificationScreen, UUID> {
    List<PmSpecificationScreen> findBySpecificationIdAndIsDeleteFalse(UUID specificationId);
    void deleteBySpecificationIdAndIsDeleteFalse(UUID specificationId);
}