package com.softinter.sicapi.repository.su;

import com.softinter.sicapi.entity.su.SuUpload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuUploadRepository extends JpaRepository<SuUpload, UUID> {
    List<SuUpload> findByUploadGroupIdAndIsActiveTrue(UUID uploadGroupId);
    Optional<SuUpload> findByIdAndIsActiveTrue(UUID id);
}
