package com.softinter.sicapi.repository.db;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.db.DbTitle;

@Repository
public interface DbTitleRepository extends JpaRepository<DbTitle, UUID>, JpaSpecificationExecutor<DbTitle> {
    Page<DbTitle> findByIsActiveTrue(Pageable pageable);
    Page<DbTitle> findByIsActiveTrueAndPersonType(String personType, Pageable pageable);
    Page<DbTitle> findByIsActiveTrueAndPrefixNameEnContainingIgnoreCase(String keyword, Pageable pageable);
    Page<DbTitle> findByIsActiveTrueAndPersonTypeAndPrefixNameEnContainingIgnoreCase(String personType, String keyword, Pageable pageable);

    List<DbTitle> findByPersonTypeAndIsActiveTrue(String personType);
}