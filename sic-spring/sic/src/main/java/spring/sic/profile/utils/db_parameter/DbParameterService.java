package spring.sic.profile.utils.db_parameter;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DbParameterService {

    private final DbParameterRepository repository;

    public List<DbParameterModel> getAll() {
        return repository.findAll().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    public DbParameterModel getById(UUID id) {
        DbParameterEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbParameter not found with id: " + id));
        return toModel(entity);
    }

    @Transactional
    public DbParameterModel create(DbParameterModel model) {
        DbParameterEntity entity = new DbParameterEntity();
        copyToEntity(model, entity);
        entity.setCreatedDate(OffsetDateTime.now());
        entity.setIsDelete(false);
        DbParameterEntity saved = repository.save(entity);
        return toModel(saved);
    }

    @Transactional
    public DbParameterModel update(UUID id, DbParameterModel model) {
        DbParameterEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbParameter not found with id: " + id));
        copyToEntity(model, entity);
        entity.setUpdatedDate(OffsetDateTime.now());
        DbParameterEntity updated = repository.save(entity);
        return toModel(updated);
    }

    @Transactional
    public void delete(UUID id) {
        DbParameterEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("DbParameter not found with id: " + id));
        entity.setIsDelete(true);
        entity.setDeleteDate(OffsetDateTime.now());
        repository.save(entity);
    }

    private DbParameterModel toModel(DbParameterEntity entity) {
        DbParameterModel model = new DbParameterModel();
        model.setId(entity.getId());
        model.setModuleCode(entity.getModuleCode());
        model.setParameterCode(entity.getParameterCode());
        model.setParameterValue(entity.getParameterValue());
        model.setParameterNameEn(entity.getParameterNameEn());
        model.setParameterNameLocal(entity.getParameterNameLocal());
        model.setIsActive(entity.getIsActive());
        model.setSortOrder(entity.getSortOrder());
        model.setCreatedBy(entity.getCreatedBy());
        model.setCreatedDate(entity.getCreatedDate());
        model.setUpdatedBy(entity.getUpdatedBy());
        model.setUpdatedDate(entity.getUpdatedDate());
        model.setIsDelete(entity.getIsDelete());
        model.setDeleteBy(entity.getDeleteBy());
        model.setDeleteDate(entity.getDeleteDate());
        return model;
    }

    private void copyToEntity(DbParameterModel model, DbParameterEntity entity) {
        entity.setModuleCode(model.getModuleCode());
        entity.setParameterCode(model.getParameterCode());
        entity.setParameterValue(model.getParameterValue());
        entity.setParameterNameEn(model.getParameterNameEn());
        entity.setParameterNameLocal(model.getParameterNameLocal());
        entity.setIsActive(model.getIsActive());
        entity.setSortOrder(model.getSortOrder());
        entity.setCreatedBy(model.getCreatedBy());
        entity.setUpdatedBy(model.getUpdatedBy());
        entity.setDeleteBy(model.getDeleteBy());
    }
}