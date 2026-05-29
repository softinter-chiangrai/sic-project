package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuBusiness;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuBusinessRepository extends JpaRepository<SuBusiness, UUID>, JpaSpecificationExecutor<SuBusiness> {
    Optional<SuBusiness> findByIdAndIsActiveTrueAndIsDeleteFalse(UUID id);
    Optional<SuBusiness> findByBusinessCodeAndIsActiveTrueAndIsDeleteFalse(String businessCode);
    boolean existsByBusinessCodeAndIsActiveTrue(String businessCode);
}
