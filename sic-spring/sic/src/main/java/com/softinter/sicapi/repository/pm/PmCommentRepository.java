package com.softinter.sicapi.repository.pm;

import com.softinter.sicapi.entity.pm.PmComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PmCommentRepository extends JpaRepository<PmComment, UUID>, JpaSpecificationExecutor<PmComment> {

    // ดึงโพสต์หลัก (parent null) ตาม targetType และ targetId
    Page<PmComment> findByTargetTypeAndTargetIdAndParentCommentIsNullAndIsDeleteFalse(
            String targetType, UUID targetId, Pageable pageable);

    // ดึงการตอบกลับของโพสต์
    List<PmComment> findByParentCommentIdAndIsDeleteFalseOrderByCreatedDateAsc(UUID parentCommentId);

    // นับจำนวนการตอบกลับ
    long countByParentCommentIdAndIsDeleteFalse(UUID parentCommentId);

    // ดึงโพสต์ที่ปักหมุด (pinned = true)
    List<PmComment> findByTargetTypeAndTargetIdAndPinnedTrueAndIsDeleteFalseOrderByCreatedDateDesc(
            String targetType, UUID targetId);

    // ตรวจสอบว่า comment เป็นของ userId หรือไม่ (ใช้สำหรับ authorization)
    boolean existsByIdAndCreatedByAndIsDeleteFalse(UUID id, String createdBy);
}