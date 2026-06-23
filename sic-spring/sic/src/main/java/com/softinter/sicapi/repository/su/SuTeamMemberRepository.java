package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuTeamMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuTeamMemberRepository extends JpaRepository<SuTeamMember, UUID> {

    // ✅ เพิ่ม method สำหรับหน้า pmrt29 (แบ่งหน้า)
    Page<SuTeamMember> findByTeamIdAndIsActiveTrue(UUID teamId, Pageable pageable);

    List<SuTeamMember> findByTeamIdAndIsActiveTrue(UUID teamId);

    List<SuTeamMember> findByUserIdAndIsActiveTrue(String userId);

    Optional<SuTeamMember> findByTeamIdAndUserId(UUID teamId, String userId);

    boolean existsByTeamIdAndUserId(UUID teamId, String userId);

    @Modifying
    @Query("UPDATE SuTeamMember m SET m.isActive = false WHERE m.teamId = :teamId AND m.userId = :userId")
    void deactivateMember(@Param("teamId") UUID teamId, @Param("userId") String userId);
}