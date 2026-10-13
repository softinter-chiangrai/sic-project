package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmDocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.Collection;
import java.util.Optional;

@Repository
public interface PmDocumentVersionRepository extends JpaRepository<PmDocumentVersion, UUID> {
    List<PmDocumentVersion> findByDocumentTypeAndDocumentIdOrderByCreatedDateDesc(String documentType, UUID documentId);

    List<PmDocumentVersion> findByDocumentTypeAndDocumentIdAndIsDeleteFalseOrderByCreatedDateDesc(String documentType, UUID documentId);

List<PmDocumentVersion> findByDocumentTypeAndDocumentIdAndIsActiveTrueOrderByCreatedDateDesc(String documentType, UUID documentId);
    Optional<PmDocumentVersion> findFirstByDocumentTypeAndDocumentIdAndIsDeleteFalseOrderByCreatedDateDesc(String documentType, UUID documentId);
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
    /** Projection of (documentId, current version label) from pm_current_version. */
    interface CurrentVersionRow {
        String getDocumentId();
        String getLabel();
    }

    /**
     * "Current version" of a document, decided once in the DB function pm_current_version:
     * latest APPROVED version, else latest draft (no suffix); null when the document has no version row.
     */
    @Query(value = "SELECT pm_current_version(:documentType, :documentId)", nativeQuery = true)
    String currentVersionNo(@Param("documentType") String documentType, @Param("documentId") UUID documentId);

    /** Same version as currentVersionNo, suffixed " (Draft)" when the document was never approved; for PDF/report parameters. */
    @Query(value = "SELECT pm_current_version_label(:documentType, :documentId)", nativeQuery = true)
    String currentVersionLabel(@Param("documentType") String documentType, @Param("documentId") UUID documentId);

    @Query(value = "SELECT CAST(d.document_id AS text) AS documentId, pm_current_version(:documentType, d.document_id) AS label "
            + "FROM (SELECT DISTINCT document_id FROM pm_document_version "
            + "WHERE document_type = :documentType AND document_id IN (:documentIds)) d", nativeQuery = true)
    List<CurrentVersionRow> currentVersionRows(@Param("documentType") String documentType,
                                               @Param("documentIds") Collection<UUID> documentIds);
}
