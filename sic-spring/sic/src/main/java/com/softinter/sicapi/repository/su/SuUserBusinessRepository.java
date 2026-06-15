package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuUserBusiness;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuUserBusinessRepository extends JpaRepository<SuUserBusiness, UUID>, JpaSpecificationExecutor<SuUserBusiness> {

    @Query("SELECT ub FROM SuUserBusiness ub JOIN FETCH ub.business b JOIN FETCH b.title WHERE ub.userId = :userId AND ub.isActive = true AND b.isActive = true AND b.isDelete = false ORDER BY ub.isDefault DESC, b.id")
    List<SuUserBusiness> findActiveByUserId(@Param("userId") String userId);

    @Query("SELECT ub FROM SuUserBusiness ub WHERE ub.userId = :userId AND ub.business.id = :businessId AND ub.isActive = true AND ub.business.isActive = true AND ub.business.isDelete = false")
    Optional<SuUserBusiness> findByUserIdAndBusinessId(@Param("userId") String userId, @Param("businessId") UUID businessId);

    @Query("SELECT CASE WHEN COUNT(ub) > 0 THEN true ELSE false END FROM SuUserBusiness ub WHERE ub.userId = :userId AND ub.isActive = true AND ub.business.isActive = true AND ub.business.isDelete = false AND ub.business.id = :businessId")
    boolean canAccessBusiness(@Param("userId") String userId, @Param("businessId") UUID businessId);

    @Query("SELECT DISTINCT ub.business.id FROM SuUserBusiness ub WHERE ub.userId = :userId AND ub.isActive = true AND ub.business.isActive = true AND ub.business.isDelete = false")
    List<UUID> findBusinessIdsByUserId(@Param("userId") String userId);

    @Modifying
    @Query("UPDATE SuUserBusiness ub SET ub.isDefault = CASE WHEN ub.business.id = :businessId THEN true ELSE false END WHERE ub.userId = :userId AND ub.isActive = true")
    int updateDefaultBusiness(@Param("userId") String userId, @Param("businessId") UUID businessId);

    List<SuUserBusiness> findByUserIdAndIsActiveTrue(String userId);

    @Query("SELECT COUNT(ub) FROM SuUserBusiness ub WHERE ub.userId = :userId AND ub.isActive = true")
    long countByUserId(@Param("userId") String userId);

    boolean existsByUserIdAndBusinessId(String userId, UUID businessId);
}

