package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuChatGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SuChatGroupRepository extends JpaRepository<SuChatGroup, UUID> {

    @Query("SELECT g FROM SuChatGroup g JOIN g.members m WHERE m.userId = :userId AND g.isActive = true AND m.isActive = true")
    List<SuChatGroup> findByMemberUserId(@Param("userId") String userId);
}
