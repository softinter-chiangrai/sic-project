package com.softinter.sicapi.repository.su;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.su.SuUserBusinessRole;

@Repository
public interface SuUserBusinessRoleRepository extends JpaRepository<SuUserBusinessRole, UUID>, JpaSpecificationExecutor<SuUserBusinessRole> {

    @Query("SELECT DISTINCT ubr.businessRole.id FROM SuUserBusinessRole ubr " +
           "WHERE ubr.isActive = true AND ubr.userBusiness.isActive = true AND ubr.userBusiness.userId = :userId " +
           "AND ubr.userBusiness.business.isActive = true AND ubr.userBusiness.business.isDelete = false " +
           "AND ubr.businessRole.isActive = true")
    List<UUID> findBusinessRoleIdsByUserId(@Param("userId") String userId);

    @Query("SELECT DISTINCT p.programCode FROM SuUserBusinessRole ubr " +
           "JOIN ubr.businessRole.rolePrograms rp " +
           "JOIN rp.program p " +
           "WHERE ubr.isActive = true AND ubr.userBusiness.isActive = true AND ubr.userBusiness.userId = :userId " +
           "AND ubr.userBusiness.business.id = :businessId AND ubr.userBusiness.business.isActive = true " +
           "AND ubr.businessRole.isActive = true AND rp.isActive = true AND p.isActive = true")
    List<String> findAccessibleProgramCodes(@Param("userId") String userId, @Param("businessId") UUID businessId);

    boolean existsByUserBusinessIdAndBusinessRoleId(UUID userBusinessId, UUID businessRoleId);

    @Query("SELECT r FROM SuUserBusinessRole r WHERE r.userBusinessId = :userBusinessId AND r.isActive = true")
    Optional<SuUserBusinessRole> findFirstByUserBusinessIdAndIsActiveTrue(@Param("userBusinessId") UUID userBusinessId);

    @Modifying
    @Query("DELETE FROM SuUserBusinessRole r WHERE r.userBusinessId = :userBusinessId")
    void deleteByUserBusinessId(@Param("userBusinessId") UUID userBusinessId);

    @Query("SELECT ubr FROM SuUserBusinessRole ubr " +
       "LEFT JOIN FETCH ubr.businessRole " +
       "WHERE ubr.userBusiness.id = :userBusinessId " +
       "AND ubr.isActive = true " +
       "AND ubr.isDelete = false")
List<SuUserBusinessRole> findByUserBusinessIdAndIsActiveTrue(@Param("userBusinessId") UUID userBusinessId);
}
