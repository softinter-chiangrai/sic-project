package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuUpload;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface SuUploadRepository extends JpaRepository<SuUpload, UUID> {
    Optional<SuUpload> findByIdAndIsActiveTrue(UUID id);
    Optional<SuUpload> findByUploadGroupIdAndIsActiveFalse(UUID uploadGroupId);
    Optional<SuUpload> findByObjectKey(String objectKey);
}