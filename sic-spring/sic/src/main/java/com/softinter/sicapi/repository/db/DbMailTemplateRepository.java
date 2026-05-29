package com.softinter.sicapi.repository.db;

import com.softinter.sicapi.entity.db.DbMailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DbMailTemplateRepository extends JpaRepository<DbMailTemplate, UUID> {
    Optional<DbMailTemplate> findByTemplateCodeAndIsActiveTrue(String templateCode);
}
