package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmDocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmDocumentVersionRepository extends JpaRepository<PmDocumentVersion, UUID> {
    List<PmDocumentVersion> findByDocumentTypeAndDocumentIdOrderByCreatedDateDesc(String documentType, UUID documentId);

    @org.springframework.data.jpa.repository.Query("SELECT v FROM PmDocumentVersion v WHERE v.documentType = :documentType "
            + "AND v.documentId IN :documentIds ORDER BY v.createdDate DESC")
    List<PmDocumentVersion> findByDocumentTypeAndDocumentIds(
            @org.springframework.data.repository.query.Param("documentType") String documentType,
            @org.springframework.data.repository.query.Param("documentIds") java.util.Collection<UUID> documentIds);
    List<PmDocumentVersion> findByDocumentTypeAndDocumentIdAndIsActiveTrueOrderByCreatedDateDesc(String documentType, UUID documentId);
    java.util.Optional<PmDocumentVersion> findFirstByDocumentTypeAndDocumentIdAndIsDeleteFalseOrderByCreatedDateDesc(String documentType, UUID documentId);
    List<PmDocumentVersion> findByProjectIdAndIsDeleteFalseOrderByCreatedDateDesc(UUID projectId);
    List<PmDocumentVersion> findByProjectIdAndDocumentTypeAndIsDeleteFalseOrderByCreatedDateDesc(UUID projectId, String documentType);
    boolean existsByDocumentTypeAndDocumentId(String documentType, UUID documentId);

    @Query("SELECT v FROM PmDocumentVersion v WHERE (v.isDelete IS NULL OR v.isDelete = false) AND (:businessId IS NULL OR v.businessId = :businessId OR v.businessId IS NULL) ORDER BY v.createdDate DESC")
    List<PmDocumentVersion> findAllByBusinessId(@Param("businessId") UUID businessId);

    @Query("SELECT v FROM PmDocumentVersion v WHERE (v.isDelete IS NULL OR v.isDelete = false) AND (:businessId IS NULL OR v.businessId = :businessId OR v.businessId IS NULL) AND v.documentType = :documentType ORDER BY v.createdDate DESC")
    List<PmDocumentVersion> findAllByBusinessIdAndDocumentType(@Param("businessId") UUID businessId, @Param("documentType") String documentType);

    @Query("SELECT v FROM PmDocumentVersion v WHERE (v.isDelete IS NULL OR v.isDelete = false) ORDER BY v.createdDate DESC")
    List<PmDocumentVersion> findByIsDeleteFalseOrderByCreatedDateDesc();

    @Query("SELECT v FROM PmDocumentVersion v WHERE (v.isDelete IS NULL OR v.isDelete = false) AND v.documentType = :documentType ORDER BY v.createdDate DESC")
    List<PmDocumentVersion> findByDocumentTypeAndIsDeleteFalseOrderByCreatedDateDesc(@Param("documentType") String documentType);
}
