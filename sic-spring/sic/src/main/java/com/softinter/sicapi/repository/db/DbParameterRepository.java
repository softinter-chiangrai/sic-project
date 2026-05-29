package com.softinter.sicapi.repository.db;

import com.softinter.sicapi.entity.db.DbParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DbParameterRepository extends JpaRepository<DbParameter, UUID> {
    List<DbParameter> findByParamGroupAndIsActiveTrueOrderBySortOrder(String paramGroup);
    Optional<DbParameter> findByParamGroupAndParamCodeAndIsActiveTrue(String paramGroup, String paramCode);
}
