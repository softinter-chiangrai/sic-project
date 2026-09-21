package com.softinter.sicapi.util;

import com.softinter.sicapi.entity.enums.ApprovalStatus;
import com.softinter.sicapi.entity.pm.PmApproval;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

import java.util.List;
import java.util.UUID;

/**
 * รองรับการพิมพ์คำค้นหาสถานะการอนุมัติแบบไทย/อังกฤษในช่อง Search (เช่น "อนุมัติแล้ว", "รออนุมัติ", "ปฏิเสธ")
 * โดย join ไปที่ตาราง pm_approval ซึ่งเป็น Polymorphic Document (documentType + documentId)
 */
public final class ApprovalKeywordSearchHelper {

    private ApprovalKeywordSearchHelper() {
    }

    public static void addApprovalKeywordPredicates(
            CriteriaQuery<?> query,
            CriteriaBuilder cb,
            Path<UUID> idPath,
            String documentType,
            String rawKeyword,
            List<Predicate> orPreds) {

        if (containsAny(rawKeyword, "ยังไม่อนุมัติ", "ยังไม่ได้อนุมัติ", "unapproved", "not approved")) {
            Subquery<UUID> approvedSub = approvedIdsSubquery(query, cb, documentType, ApprovalStatus.APPROVED);
            orPreds.add(cb.not(idPath.in(approvedSub)));
        } else if (containsAny(rawKeyword, "อนุมัติแล้ว", "ผ่านการอนุมัติ") || rawKeyword.equals("อนุมัติ") || rawKeyword.equals("approved")) {
            orPreds.add(idPath.in(approvedIdsSubquery(query, cb, documentType, ApprovalStatus.APPROVED)));
        } else if (containsAny(rawKeyword, "รออนุมัติ", "pending")) {
            orPreds.add(idPath.in(approvedIdsSubquery(query, cb, documentType, ApprovalStatus.PENDING)));
        } else if (containsAny(rawKeyword, "ปฏิเสธ", "ไม่อนุมัติ", "rejected")) {
            orPreds.add(idPath.in(approvedIdsSubquery(query, cb, documentType, ApprovalStatus.REJECTED)));
        } else if (containsAny(rawKeyword, "ขอแก้ไข", "need revision")) {
            orPreds.add(idPath.in(approvedIdsSubquery(query, cb, documentType, ApprovalStatus.NEED_REVISION)));
        }
    }

    private static Subquery<UUID> approvedIdsSubquery(CriteriaQuery<?> query, CriteriaBuilder cb, String documentType, ApprovalStatus status) {
        Subquery<UUID> sub = query.subquery(UUID.class);
        Root<PmApproval> approvalRoot = sub.from(PmApproval.class);
        sub.select(approvalRoot.get("documentId"))
                .where(
                        cb.equal(approvalRoot.get("documentType"), documentType),
                        cb.isFalse(approvalRoot.get("isDelete")),
                        cb.equal(approvalRoot.get("status"), status)
                );
        return sub;
    }

    private static boolean containsAny(String keyword, String... needles) {
        for (String needle : needles) {
            if (keyword.contains(needle)) {
                return true;
            }
        }
        return false;
    }
}
