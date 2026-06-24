package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuBusinessInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuBusinessInviteRepository extends JpaRepository<SuBusinessInvite, UUID> {
    List<SuBusinessInvite> findBySuBusinessRole_BusinessIdAndIsDeleteFalse(UUID businessId);
    Optional<SuBusinessInvite> findByInviteTokenAndIsDeleteFalse(String inviteToken);
    
}