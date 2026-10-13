package com.softinter.sicapi.util;

import com.softinter.sicapi.entity.pm.PmDocumentVersion;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

import java.util.List;
import java.util.UUID;

/** ค้นหาด้วยเลขเวอร์ชันในช่อง Search: เลขเวอร์ชันอยู่ที่ pm_document_version ไม่ได้อยู่ในตารางเอกสารแล้ว */
public final class VersionKeywordSearchHelper {

    private VersionKeywordSearchHelper() {
    }

    public static void addVersionPredicate(CriteriaQuery<?> query, CriteriaBuilder cb, Path<UUID> idPath,
                                           String documentType, String likePattern, List<Predicate> orPreds) {
        Subquery<UUID> sub = query.subquery(UUID.class);
        Root<PmDocumentVersion> v = sub.from(PmDocumentVersion.class);
        sub.select(v.get("documentId")).where(
                cb.equal(v.get("documentType"), documentType),
                cb.isFalse(v.get("isDelete")),
                cb.like(cb.lower(v.get("versionNo")), likePattern));
        orPreds.add(idPath.in(sub));
    }
}
