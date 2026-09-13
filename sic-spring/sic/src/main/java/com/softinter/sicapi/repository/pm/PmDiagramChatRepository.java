package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmDiagramChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmDiagramChatRepository extends JpaRepository<PmDiagramChat, UUID> {

    List<PmDiagramChat> findByDiagramIdAndIsDeleteFalseOrderByCreatedDateAsc(UUID diagramId);

    List<PmDiagramChat> findByDiagramIdAndSessionIdAndIsDeleteFalseOrderByCreatedDateAsc(UUID diagramId, UUID sessionId);

    @Modifying
    @Query("UPDATE PmDiagramChat c SET c.isDelete = true WHERE c.diagram.id = :diagramId AND c.isDelete = false")
    void deleteByDiagramIdAndIsDeleteFalse(@Param("diagramId") UUID diagramId);

    @Modifying
    @Query("UPDATE PmDiagramChat c SET c.isDelete = true WHERE c.diagram.id = :diagramId AND c.sessionId = :sessionId AND c.isDelete = false")
    void deleteByDiagramIdAndSessionId(@Param("diagramId") UUID diagramId, @Param("sessionId") UUID sessionId);

    @Modifying
    @Query("UPDATE PmDiagramChat c SET c.sessionTitle = :title WHERE c.diagram.id = :diagramId AND c.sessionId = :sessionId AND c.isDelete = false")
    void updateSessionTitle(@Param("diagramId") UUID diagramId, @Param("sessionId") UUID sessionId, @Param("title") String title);
}