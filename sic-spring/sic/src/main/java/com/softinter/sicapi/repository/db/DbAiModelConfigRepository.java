package com.softinter.sicapi.repository.db;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.db.DbAiModelConfig;

@Repository
public interface DbAiModelConfigRepository extends JpaRepository<DbAiModelConfig, UUID>, JpaSpecificationExecutor<DbAiModelConfig> {
    List<DbAiModelConfig> findByIsDeleteFalseOrderBySortOrderAsc();
    List<DbAiModelConfig> findByIsDeleteFalseAndIsActiveTrueOrderBySortOrderAsc();
    Optional<DbAiModelConfig> findByModelCodeAndIsDeleteFalse(String modelCode);
    Optional<DbAiModelConfig> findByIsDeleteFalseAndIsActiveTrueAndIsDefaultTrue();
    boolean existsByModelCodeAndIsDeleteFalse(String modelCode);
    boolean existsByModelCodeAndIsDeleteFalseAndIdNot(String modelCode, UUID id);
}
