package com.softinter.sicapi.repository.su;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.softinter.sicapi.entity.su.SuUpload;

public interface SuUploadRepository extends JpaRepository<SuUpload, UUID> {
    Optional<SuUpload> findByIdAndIsActiveTrue(UUID id);
    Optional<SuUpload> findByUploadGroupIdAndIsActiveFalse(UUID uploadGroupId);
    Optional<SuUpload> findByObjectKey(String objectKey);
    Optional<SuUpload> findFirstByUploadGroupIdAndIsActiveTrueOrderByCreatedDateDesc(UUID uploadGroupId);
    List<SuUpload> findAllByIsActiveFalseAndTempExpiresAtBefore(Instant now);

    @Query("SELECT u FROM SuUpload u WHERE u.uploadGroupId = :groupId AND u.isActive = true ORDER BY u.createdDate DESC")
    List<SuUpload> findAllByUploadGroupIdAndIsActiveTrueOrderByCreatedDateDesc(@Param("groupId") UUID uploadGroupId);

    @Modifying
    @Query("UPDATE SuUpload u SET u.isDelete = true, u.deleteBy = :deleteBy, u.deleteDate = :deleteDate " +
           "WHERE u.id = :id AND u.isActive = false AND u.tempExpiresAt < :now")
    int softDeleteExpiredUpload(@Param("id") UUID id,
                                @Param("deleteBy") String deleteBy,
                                @Param("deleteDate") Instant deleteDate,
                                @Param("now") Instant now);

}