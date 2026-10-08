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

    List<PmDiagramTab> findByUserIdAndIsDeleteFalseOrderBySortOrderAscCreatedDateAsc(String userId);

    @Query("SELECT d FROM PmDiagramTab d WHERE d.projectId = :projectId AND d.isDelete = false AND LOWER(d.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<PmDiagramTab> searchByProjectIdAndKeyword(@Param("projectId") UUID projectId, @Param("keyword") String keyword);

    @Query("SELECT d FROM PmDiagramTab d WHERE d.projectId = :projectId AND d.isDelete = false AND d.diagramType = :type")
    List<PmDiagramTab> findByProjectIdAndDiagramType(@Param("projectId") UUID projectId, @Param("type") String type);

    /** diagram ที่มี Mermaid แต่ยังไม่มีรูป PNG (graph_data.png / pages[].png ว่าง) ใช้ให้ frontend render รูปเบื้องหลัง */
    @Query(value = """
            SELECT d.id FROM pm_diagram d
            WHERE d.business_id = :businessId AND d.is_delete = false
              AND COALESCE(btrim(d.mermaid_script), '') <> ''
              AND COALESCE(btrim(d.graph_data->>'png'), '') = ''
              AND jsonb_array_length(CASE WHEN jsonb_typeof(d.graph_data->'pages') = 'array' THEN d.graph_data->'pages' ELSE CAST('[]' AS jsonb) END) = 0
            ORDER BY d.created_date
            LIMIT 30
            """, nativeQuery = true)
    List<UUID> findIdsMissingImage(@Param("businessId") UUID businessId);

    int countByProjectIdAndIsDeleteFalse(UUID projectId);

    boolean existsByBusinessIdAndProjectIdAndDiagramCodeAndIsDeleteFalse(
            UUID businessId, UUID projectId, String diagramCode);
}