package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmDiagramChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmDiagramChatRepository extends JpaRepository<PmDiagramChat, UUID> {

    List<PmDiagramChat> findByDiagramIdAndIsDeleteFalseOrderByCreatedDateAsc(UUID diagramId);

    void deleteByDiagramIdAndIsDeleteFalse(UUID diagramId);
}