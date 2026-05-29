package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuMessageRepository extends JpaRepository<SuMessage, UUID> {
    List<SuMessage> findByModuleAndIsActiveTrueOrderByMessageKey(String module);
    Optional<SuMessage> findByModuleAndMessageKeyAndIsActiveTrue(String module, String messageKey);
}
