package spring.sic.profile.su.su_user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuUserService {

    private final SuUserRepository repository;

    public List<SuUserModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public SuUserModel getById(UUID id) {
        SuUserEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuUser not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public SuUserModel create(SuUserModel model) {
        SuUserEntity entity = new SuUserEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        SuUserEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public SuUserModel update(UUID id, SuUserModel model) {
        SuUserEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuUser not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        SuUserEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        SuUserEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuUser not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private SuUserModel toModel(SuUserEntity entity) {
        SuUserModel model = new SuUserModel();
        model.setId(entity.getId());
        model.setKeycloakUserId(entity.getKeycloakUserId());
        model.setIsActive(entity.getIsActive());
        model.setCreatedBy(entity.getCreatedBy());
        model.setCreatedDate(entity.getCreatedDate());
        model.setUpdatedBy(entity.getUpdatedBy());
        model.setUpdatedDate(entity.getUpdatedDate());
        model.setIsDelete(entity.getIsDelete());
        model.setDeleteBy(entity.getDeleteBy());
        model.setDeleteDate(entity.getDeleteDate());
        return model;
    }

    private void copyToEntity(SuUserModel model, SuUserEntity entity) {
        entity.setKeycloakUserId(model.getKeycloakUserId());
        entity.setIsActive(model.getIsActive());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}
