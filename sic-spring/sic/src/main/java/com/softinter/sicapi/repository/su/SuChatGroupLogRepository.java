package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuChatGroupLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SuChatGroupLogRepository extends JpaRepository<SuChatGroupLog, UUID> {
    List<SuChatGroupLog> findByGroupIdAndIsActiveTrueOrderByCreatedDateAsc(UUID groupId);
}
