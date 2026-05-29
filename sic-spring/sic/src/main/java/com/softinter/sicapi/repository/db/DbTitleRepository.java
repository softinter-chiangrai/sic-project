package com.softinter.sicapi.repository.db;

import com.softinter.sicapi.entity.db.DbTitle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DbTitleRepository extends JpaRepository<DbTitle, UUID> {
    List<DbTitle> findByIsActiveTrueOrderByTitleNameEn();
}
