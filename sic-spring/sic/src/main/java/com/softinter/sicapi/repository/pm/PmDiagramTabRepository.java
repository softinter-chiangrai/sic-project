package com.softinter.sicapi.repository.pm;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.pm.PmDiagramTab;

@Repository
public interface PmDiagramTabRepository extends JpaRepository<PmDiagramTab, UUID> {

    List<PmDiagramTab> findByProjectIdAndIsDeleteFalseOrderBySortOrderAscCreatedDateAsc(UUID projectId);

    List<PmDiagramTab> findByUserIdAndIsDeleteFalseOrderBySortOrderAscCreatedDateAsc(String userId);

    @Query("SELECT d FROM PmDiagramTab d WHERE d.projectId = :projectId AND d.isDelete = false AND LOWER(d.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<PmDiagramTab> searchByProjectIdAndKeyword(@Param("projectId") UUID projectId, @Param("keyword") String keyword);

    @Query("SELECT d FROM PmDiagramTab d WHERE d.projectId = :projectId AND d.isDelete = false AND d.diagramType = :type")
    List<PmDiagramTab> findByProjectIdAndDiagramType(@Param("projectId") UUID projectId, @Param("type") String type);

    int countByProjectIdAndIsDeleteFalse(UUID projectId);
}