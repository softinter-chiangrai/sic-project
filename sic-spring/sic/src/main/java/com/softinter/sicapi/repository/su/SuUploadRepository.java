package com.softinter.sicapi.repository.su;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.softinter.sicapi.entity.su.SuUpload;

public interface SuUploadRepository extends JpaRepository<SuUpload, UUID> {
    Optional<SuUpload> findByIdAndIsActiveTrue(UUID id);
    Optional<SuUpload> findByUploadGroupIdAndIsActiveFalse(UUID uploadGroupId);
    Optional<SuUpload> findByObjectKey(String objectKey);
    Optional<SuUpload> findFirstByUploadGroupIdAndIsActiveTrueOrderByCreatedDateDesc(UUID uploadGroupId);
    List<SuUpload> findAllByIsActiveFalseAndTempExpiresAtBefore(Instant now);
}