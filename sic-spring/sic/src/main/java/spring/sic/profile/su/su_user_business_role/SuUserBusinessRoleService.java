package spring.sic.profile.su.su_user_business_role;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuUserBusinessRoleService {

    private final SuUserBusinessRoleRepository repository;

    public List<SuUserBusinessRoleModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public SuUserBusinessRoleModel getById(UUID id) {
        SuUserBusinessRoleEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuUserBusinessRole not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public SuUserBusinessRoleModel create(SuUserBusinessRoleModel model) {
        SuUserBusinessRoleEntity entity = new SuUserBusinessRoleEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        SuUserBusinessRoleEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public SuUserBusinessRoleModel update(UUID id, SuUserBusinessRoleModel model) {
        SuUserBusinessRoleEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuUserBusinessRole not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        SuUserBusinessRoleEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        SuUserBusinessRoleEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuUserBusinessRole not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private SuUserBusinessRoleModel toModel(SuUserBusinessRoleEntity entity) {
        SuUserBusinessRoleModel model = new SuUserBusinessRoleModel();
        model.setId(entity.getId());
        model.setUserBusinessId(entity.getUserBusinessId());
        model.setBusinessRoleId(entity.getBusinessRoleId());
        model.setIsPrimary(entity.getIsPrimary());
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

    private void copyToEntity(SuUserBusinessRoleModel model, SuUserBusinessRoleEntity entity) {
        entity.setUserBusinessId(model.getUserBusinessId());
        entity.setBusinessRoleId(model.getBusinessRoleId());
        entity.setIsPrimary(model.getIsPrimary());
        entity.setIsActive(model.getIsActive());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}