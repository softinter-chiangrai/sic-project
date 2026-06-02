package com.softinter.sicapi.repository.db;

import com.softinter.sicapi.entity.db.DbMailConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DbMailConfigRepository extends JpaRepository<DbMailConfig, UUID> {
    Optional<DbMailConfig> findByConfigNameAndIsActiveTrue(String configName);
}
