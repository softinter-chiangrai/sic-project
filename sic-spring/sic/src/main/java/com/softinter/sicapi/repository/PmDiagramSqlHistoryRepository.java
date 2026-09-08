package com.softinter.sicapi.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.PmDiagramSqlHistory;

@Repository
public interface PmDiagramSqlHistoryRepository extends JpaRepository<PmDiagramSqlHistory, UUID> {

    List<PmDiagramSqlHistory> findByTabIdOrderByVersionNoDesc(String tabId);

    Optional<PmDiagramSqlHistory> findTopByTabIdOrderByVersionNoDesc(String tabId);

    Optional<PmDiagramSqlHistory> findByTabIdAndVersionNo(String tabId, Integer versionNo);
}
