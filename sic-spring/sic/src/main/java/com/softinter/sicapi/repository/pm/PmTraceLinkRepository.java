// src/main/java/com/softinter/sicapi/repository/pm/PmTraceLinkRepository.java
package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmTraceLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmTraceLinkRepository extends JpaRepository<PmTraceLink, UUID> {

    // ✅ แก้ไข: เพิ่ม AND t.isDelete = false
    @Query("SELECT t FROM PmTraceLink t WHERE t.sourceType = :sourceType AND t.sourceId = :sourceId AND t.isDelete = false")
    List<PmTraceLink> findBySourceTypeAndSourceId(@Param("sourceType") String sourceType, @Param("sourceId") UUID sourceId);

    // ✅ แก้ไข: เพิ่ม AND t.isDelete = false
    @Query("SELECT t FROM PmTraceLink t WHERE t.targetType = :targetType AND t.targetId = :targetId AND t.isDelete = false")
    List<PmTraceLink> findByTargetTypeAndTargetId(@Param("targetType") String targetType, @Param("targetId") UUID targetId);

    // ✅ ปรับปรุง: เพิ่ม Cycle Detection (visited_ids) และ Depth Guard ป้องกัน Infinite Loop
    @Query(value = """
        WITH RECURSIVE trace AS (
            SELECT source_type, source_id, target_type, target_id, relationship_type,
                   ARRAY[source_id, target_id] AS visited_ids,
                   1 AS depth
            FROM pm_trace_link
            WHERE is_delete = false AND (
                (source_type = :sourceType AND source_id = :sourceId)
                OR (target_type = :sourceType AND target_id = :sourceId)
            )
            UNION
            SELECT l.source_type, l.source_id, l.target_type, l.target_id, l.relationship_type,
                   t.visited_ids || ARRAY[l.source_id, l.target_id],
                   t.depth + 1
            FROM pm_trace_link l
            INNER JOIN trace t ON (
                (t.target_type = l.source_type AND t.target_id = l.source_id)
                OR (t.source_type = l.target_type AND t.source_id = l.target_id)
                OR (t.target_type = l.target_type AND t.target_id = l.target_id)
                OR (t.source_type = l.source_type AND t.source_id = l.source_id)
            )
            WHERE l.is_delete = false
              AND t.depth < 20
              AND NOT (l.source_id = ANY(t.visited_ids) AND l.target_id = ANY(t.visited_ids))
        )
        SELECT DISTINCT source_type, source_id, target_type, target_id, relationship_type FROM trace
        """, nativeQuery = true)
    List<Object[]> findFullTrace(@Param("sourceType") String sourceType,
                                 @Param("sourceId") UUID sourceId);

    // ✅ เพิ่ม: Soft delete ลิงก์ที่ผูกกับเอกสารที่ถูกลบ (ป้องกัน Orphan Links)
    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE PmTraceLink t SET t.isDelete = true, t.deleteDate = CURRENT_TIMESTAMP WHERE t.isDelete = false AND ((t.sourceType = :entityType AND t.sourceId = :entityId) OR (t.targetType = :entityType AND t.targetId = :entityId))")
    int softDeleteByEntity(@Param("entityType") String entityType, @Param("entityId") UUID entityId);

    // ✅ แก้ไข: เพิ่ม AND t.isDelete = false
    @Query("SELECT t FROM PmTraceLink t WHERE t.sourceType = :sourceType AND t.sourceId = :sourceId AND t.targetType = :targetType AND t.targetId = :targetId AND t.isDelete = false")
    List<PmTraceLink> findExistingLink(@Param("sourceType") String sourceType,
                                       @Param("sourceId") UUID sourceId,
                                       @Param("targetType") String targetType,
                                       @Param("targetId") UUID targetId);

    // ✅ แก้ไข: เพิ่ม AND t.isDelete = false
    @Query("SELECT t FROM PmTraceLink t WHERE t.projectId = :projectId AND t.isDelete = false")
    List<PmTraceLink> findAllByProjectId(@Param("projectId") UUID projectId);
}