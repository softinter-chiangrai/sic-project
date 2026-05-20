package spring.sic.profile.su.su_verify;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuVerifyService {

    private final SuVerifyRepository repository;

    public List<SuVerifyModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public SuVerifyModel getById(UUID id) {
        SuVerifyEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuVerify not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public SuVerifyModel create(SuVerifyModel model) {
        SuVerifyEntity entity = new SuVerifyEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        SuVerifyEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public SuVerifyModel update(UUID id, SuVerifyModel model) {
        SuVerifyEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuVerify not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        SuVerifyEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        SuVerifyEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuVerify not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private SuVerifyModel toModel(SuVerifyEntity entity) {
        SuVerifyModel model = new SuVerifyModel();
        model.setId(entity.getId());
        model.setVerifyType(entity.getVerifyType());
        model.setReferenceNumber(entity.getReferenceNumber());
        model.setToken(entity.getToken());
        model.setMaxRetry(entity.getMaxRetry());
        model.setRetryCount(entity.getRetryCount());
        model.setExpireAt(entity.getExpireAt());
        model.setRecipient(entity.getRecipient());
        model.setCreatedBy(entity.getCreatedBy());
        model.setCreatedDate(entity.getCreatedDate());
        model.setUpdatedBy(entity.getUpdatedBy());
        model.setUpdatedDate(entity.getUpdatedDate());
        model.setIsDelete(entity.getIsDelete());
        model.setDeleteBy(entity.getDeleteBy());
        model.setDeleteDate(entity.getDeleteDate());
        return model;
    }

    private void copyToEntity(SuVerifyModel model, SuVerifyEntity entity) {
        entity.setVerifyType(model.getVerifyType());
        entity.setReferenceNumber(model.getReferenceNumber());
        entity.setToken(model.getToken());
        entity.setMaxRetry(model.getMaxRetry());
        entity.setRetryCount(model.getRetryCount());
        entity.setExpireAt(model.getExpireAt());
        entity.setRecipient(model.getRecipient());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}