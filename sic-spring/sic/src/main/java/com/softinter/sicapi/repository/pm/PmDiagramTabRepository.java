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

    List<PmDiagramTab> findByBusinessIdAndProjectIdAndIsDeleteFalseOrderBySortOrderAscCreatedDateAsc(UUID businessId, UUID projectId);

    List<PmDiagramTab> findByBusinessIdAndIsDeleteFalseOrderBySortOrderAscCreatedDateAsc(UUID businessId);

    @Query("SELECT d FROM PmDiagramTab d WHERE d.projectId = :projectId AND d.isDelete = false AND LOWER(d.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<PmDiagramTab> searchByProjectIdAndKeyword(@Param("projectId") UUID projectId, @Param("keyword") String keyword);

    @Query("SELECT d FROM PmDiagramTab d WHERE d.projectId = :projectId AND d.isDelete = false AND d.diagramType = :type")
    List<PmDiagramTab> findByProjectIdAndDiagramType(@Param("projectId") UUID projectId, @Param("type") String type);

    int countByProjectIdAndIsDeleteFalse(UUID projectId);

    boolean existsByBusinessIdAndProjectIdAndDiagramCodeAndIsDeleteFalse(
            UUID businessId, UUID projectId, String diagramCode);

    @Query(value = "SELECT * FROM pm_diagram d WHERE d.project_id = :projectId AND d.is_delete = false AND (d.embedding <=> cast(:vec as vector)) < :maxDistance ORDER BY d.embedding <=> cast(:vec as vector) LIMIT :lim", nativeQuery = true)
    List<PmDiagramTab> findTopSimilar(@Param("projectId") UUID projectId, @Param("vec") String vec, @Param("maxDistance") double maxDistance, @Param("lim") int lim);
}