package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuBusinessRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuBusinessRoleRepository extends JpaRepository<SuBusinessRole, UUID>, JpaSpecificationExecutor<SuBusinessRole> {

    @Query("SELECT r FROM SuBusinessRole r LEFT JOIN FETCH r.parentRole WHERE r.id = :id AND r.isDelete = false")
    Optional<SuBusinessRole> findByIdWithParent(@Param("id") UUID id);

    @Query("SELECT r FROM SuBusinessRole r WHERE r.business.id = :businessId AND r.isDelete = false AND r.isActive = true ORDER BY r.sortOrder, r.roleCode")
    List<SuBusinessRole> findActiveByBusinessId(@Param("businessId") UUID businessId);

    @Query("SELECT r FROM SuBusinessRole r WHERE r.business.id = :businessId AND r.isDelete = false ORDER BY r.sortOrder, r.roleCode")
    List<SuBusinessRole> findAllByBusinessId(@Param("businessId") UUID businessId);

    boolean existsByBusinessIdAndRoleCodeAndIsDeleteFalse(UUID businessId, String roleCode);

    Optional<SuBusinessRole> findByIdAndBusinessId(UUID id, UUID businessId);
    List<SuBusinessRole> findByBusinessIdAndIsActiveTrue(UUID businessId);
    
     @Query("SELECT r FROM SuBusinessRole r WHERE r.business.id = :businessId AND r.roleCode = :roleCode AND r.isDelete = false")
    Optional<SuBusinessRole> findByBusinessIdAndRoleCodeAndIsDeleteFalse(
        @Param("businessId") UUID businessId, 
        @Param("roleCode") String roleCode
    );
  

  
}
