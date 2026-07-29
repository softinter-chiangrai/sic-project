package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmSpecificationField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmSpecificationFieldRepository extends JpaRepository<PmSpecificationField, UUID> {
    List<PmSpecificationField> findBySpecificationIdAndIsDeleteFalse(UUID specificationId);
    void deleteBySpecificationIdAndIsDeleteFalse(UUID specificationId);
}