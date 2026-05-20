package spring.sic.profile.su.su_user_business;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuUserBusinessService {

    private final SuUserBusinessRepository repository;

    public List<SuUserBusinessModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public SuUserBusinessModel getById(UUID id) {
        SuUserBusinessEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuUserBusiness not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public SuUserBusinessModel create(SuUserBusinessModel model) {
        SuUserBusinessEntity entity = new SuUserBusinessEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        SuUserBusinessEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public SuUserBusinessModel update(UUID id, SuUserBusinessModel model) {
        SuUserBusinessEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuUserBusiness not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        SuUserBusinessEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        SuUserBusinessEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SuUserBusiness not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private SuUserBusinessModel toModel(SuUserBusinessEntity entity) {
        SuUserBusinessModel model = new SuUserBusinessModel();
        model.setId(entity.getId());
        model.setUserBusinessId(entity.getUserBusinessId());
        model.setBusinessRoleId(entity.getBusinessRoleId());
        model.setIsPrimary(entity.getIsPrimary());
        model.setIsDefault(entity.getIsDefault());
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

    private void copyToEntity(SuUserBusinessModel model, SuUserBusinessEntity entity) {
        entity.setUserBusinessId(model.getUserBusinessId());
        entity.setBusinessRoleId(model.getBusinessRoleId());
        entity.setIsPrimary(model.getIsPrimary());
        entity.setIsDefault(model.getIsDefault());
        entity.setIsActive(model.getIsActive());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}