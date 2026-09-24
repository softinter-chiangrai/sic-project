package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuBusinessInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuBusinessInviteRepository extends JpaRepository<SuBusinessInvite, UUID> {
    
    @Query("SELECT i FROM SuBusinessInvite i LEFT JOIN FETCH i.suBusinessRole r WHERE i.businessId = :businessId AND i.isDelete = false ORDER BY i.createdDate DESC")
    List<SuBusinessInvite> findAllByBusinessIdWithFetch(@Param("businessId") UUID businessId);

    List<SuBusinessInvite> findBySuBusinessRole_BusinessIdAndIsDeleteFalse(UUID businessId);

    @Query("SELECT i FROM SuBusinessInvite i LEFT JOIN FETCH i.suBusinessRole r WHERE i.inviteToken = :inviteToken AND i.isDelete = false")
    Optional<SuBusinessInvite> findByInviteTokenAndIsDeleteFalse(@Param("inviteToken") String inviteToken);
}