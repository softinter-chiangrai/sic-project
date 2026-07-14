package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmDiagramVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmDiagramVersionRepository extends JpaRepository<PmDiagramVersion, UUID> {

    List<PmDiagramVersion> findByDiagramIdAndIsDeleteFalseOrderByVersionNumberDesc(UUID diagramId);

    PmDiagramVersion findTopByDiagramIdAndIsDeleteFalseOrderByVersionNumberDesc(UUID diagramId);

    int countByDiagramIdAndIsDeleteFalse(UUID diagramId);
}