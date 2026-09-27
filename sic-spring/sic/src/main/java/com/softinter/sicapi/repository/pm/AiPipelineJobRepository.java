package com.softinter.sicapi.repository.pm;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.softinter.sicapi.entity.pm.AiPipelineJob;

@Repository
public interface AiPipelineJobRepository extends JpaRepository<AiPipelineJob, UUID> {
    Optional<AiPipelineJob> findByIdAndBusinessIdAndIsDeleteFalse(UUID id, UUID businessId);
    Page<AiPipelineJob> findByBusinessIdAndIsDeleteFalseOrderByCreatedDateDesc(UUID businessId, Pageable pageable);
    List<AiPipelineJob> findByStatusAndIsDeleteFalse(String status);
}
