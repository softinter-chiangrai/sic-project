package spring.sic.profile.su.su_upload;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuUploadService {

    private final SuUploadRepository repository;

    public List<SuUploadModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public SuUploadModel getById(UUID id) {
        SuUploadEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuUpload not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public SuUploadModel create(SuUploadModel model) {
        SuUploadEntity entity = new SuUploadEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        SuUploadEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public SuUploadModel update(UUID id, SuUploadModel model) {
        SuUploadEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuUpload not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        SuUploadEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        SuUploadEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuUpload not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private SuUploadModel toModel(SuUploadEntity entity) {
        SuUploadModel model = new SuUploadModel();
        model.setId(entity.getId());
        model.setBusinessId(entity.getBusinessId());
        model.setBucketName(entity.getBucketName());
        model.setObjectKey(entity.getObjectKey());
        model.setFileName(entity.getFileName());
        model.setContentType(entity.getContentType());
        model.setFileSize(entity.getFileSize());
        model.setCategory(entity.getCategory());
        model.setVisibility(entity.getVisibility());
        model.setStorageUrl(entity.getStorageUrl());
        model.setIsStreaming(entity.getIsStreaming());
        model.setIsActive(entity.getIsActive());
        model.setUploadGroupId(entity.getUploadGroupId());
        model.setTempExpiresAt(entity.getTempExpiresAt());
        model.setCreatedBy(entity.getCreatedBy());
        model.setCreatedDate(entity.getCreatedDate());
        model.setUpdatedBy(entity.getUpdatedBy());
        model.setUpdatedDate(entity.getUpdatedDate());
        model.setIsDelete(entity.getIsDelete());
        model.setDeleteBy(entity.getDeleteBy());
        model.setDeleteDate(entity.getDeleteDate());
        return model;
    }

    private void copyToEntity(SuUploadModel model, SuUploadEntity entity) {
        entity.setBusinessId(model.getBusinessId());
        entity.setBucketName(model.getBucketName());
        entity.setObjectKey(model.getObjectKey());
        entity.setFileName(model.getFileName());
        entity.setContentType(model.getContentType());
        entity.setFileSize(model.getFileSize());
        entity.setCategory(model.getCategory());
        entity.setVisibility(model.getVisibility());
        entity.setStorageUrl(model.getStorageUrl());
        entity.setIsStreaming(model.getIsStreaming());
        entity.setIsActive(model.getIsActive());
        entity.setUploadGroupId(model.getUploadGroupId());
        entity.setTempExpiresAt(model.getTempExpiresAt());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}