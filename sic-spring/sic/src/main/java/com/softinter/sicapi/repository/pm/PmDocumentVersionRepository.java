package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmDocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmDocumentVersionRepository extends JpaRepository<PmDocumentVersion, UUID> {
    List<PmDocumentVersion> findByDocumentTypeAndDocumentIdOrderByCreatedDateDesc(String documentType, UUID documentId);
    List<PmDocumentVersion> findByDocumentTypeAndDocumentIdAndIsActiveTrueOrderByCreatedDateDesc(String documentType, UUID documentId);
    java.util.Optional<PmDocumentVersion> findFirstByDocumentTypeAndDocumentIdAndIsDeleteFalseOrderByCreatedDateDesc(String documentType, UUID documentId);
    List<PmDocumentVersion> findByProjectIdAndIsDeleteFalseOrderByCreatedDateDesc(UUID projectId);
    List<PmDocumentVersion> findByProjectIdAndDocumentTypeAndIsDeleteFalseOrderByCreatedDateDesc(UUID projectId, String documentType);
    boolean existsByDocumentTypeAndDocumentId(String documentType, UUID documentId);
}