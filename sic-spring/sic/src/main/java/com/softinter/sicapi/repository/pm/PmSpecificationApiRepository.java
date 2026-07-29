package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmSpecificationApi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmSpecificationApiRepository extends JpaRepository<PmSpecificationApi, UUID> {
    List<PmSpecificationApi> findBySpecificationIdAndIsDeleteFalse(UUID specificationId);
    void deleteBySpecificationIdAndIsDeleteFalse(UUID specificationId);
}