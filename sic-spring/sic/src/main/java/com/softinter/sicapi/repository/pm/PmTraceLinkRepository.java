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

    List<PmTraceLink> findBySourceTypeAndSourceId(String sourceType, UUID sourceId);

    List<PmTraceLink> findByTargetTypeAndTargetId(String targetType, UUID targetId);

    List<PmTraceLink> findByProjectIdAndSourceTypeAndSourceId(UUID projectId, String sourceType, UUID sourceId);

    @Query(value = """
        WITH RECURSIVE trace AS (
            SELECT source_type, source_id, target_type, target_id, relationship_type
            FROM pm_trace_link
            WHERE source_type = :sourceType AND source_id = :sourceId AND is_delete = false
            UNION ALL
            SELECT l.source_type, l.source_id, l.target_type, l.target_id, l.relationship_type
            FROM pm_trace_link l
            INNER JOIN trace t ON t.target_type = l.source_type AND t.target_id = l.source_id
            WHERE l.is_delete = false
        )
        SELECT * FROM trace
        """, nativeQuery = true)
    List<Object[]> findFullTrace(@Param("sourceType") String sourceType,
                                 @Param("sourceId") UUID sourceId);

    @Query("SELECT t FROM PmTraceLink t WHERE t.sourceType = :sourceType AND t.sourceId = :sourceId AND t.targetType = :targetType AND t.targetId = :targetId AND t.isDelete = false")
    List<PmTraceLink> findExistingLink(@Param("sourceType") String sourceType,
                                       @Param("sourceId") UUID sourceId,
                                       @Param("targetType") String targetType,
                                       @Param("targetId") UUID targetId);

    @Query("SELECT t FROM PmTraceLink t WHERE t.projectId = :projectId AND t.isDelete = false")
    List<PmTraceLink> findAllByProjectId(@Param("projectId") UUID projectId);
}